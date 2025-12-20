import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useCohortStore } from './cohortStore';

// 신청자 정보
export interface Application {
  id: string;           // 고유 ID (UUID from Supabase)
  name: string;
  email: string;
  phone: string;        // 휴대폰 번호 (SMS 알림용)
  motivation: string;
  cohortId: string | null;     // 승인 시 어드민이 할당하는 기수
  status: 'pending' | 'approved' | 'rejected';
  code: string | null;  // 승인 시 발급되는 코드
  appliedAt: Date;
  processedAt: Date | null;  // 승인/거절 처리 시간
  codeUsedAt: Date | null;  // 코드 사용 시간
}

interface ApplicationStore {
  applications: Application[];
  loading: boolean;
  initialized: boolean;

  // Actions
  loadApplications: () => Promise<void>;
  submitApplication: (data: { name: string; email: string; phone: string; motivation: string }) => Promise<void>;
  approveApplication: (applicationId: string, cohortId: string) => Promise<string>;  // Returns code
  rejectApplication: (applicationId: string) => Promise<void>;
  verifyCode: (code: string) => Promise<{ valid: boolean; cohortId?: string; applicationId?: string; phoneNumber?: string }>;
  markCodeAsUsed: (code: string) => Promise<void>;
  getApplicationsByStatus: (status: Application['status']) => Application[];
  getApplicationsByCohort: (cohortId: string) => Application[];
}

// 6자리 랜덤 코드 생성
const generateCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
  applications: [],
  loading: false,
  initialized: false,

  // Supabase에서 신청서 로드 (Edge Function 사용)
  loadApplications: async () => {
    try {
      set({ loading: true });

      // 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error('No session found');
        set({ loading: false });
        return;
      }

      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke('admin-get-applications', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error || !data || !data.success) {
        console.error('Failed to load applications:', error);
        set({ loading: false });
        return;
      }

      const applications: Application[] = (data.applications || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone_number || '',
        motivation: row.motivation,
        cohortId: row.cohort_id,
        status: row.status,
        code: row.code,
        appliedAt: new Date(row.applied_at),
        processedAt: row.processed_at ? new Date(row.processed_at) : null,
        codeUsedAt: row.code_used_at ? new Date(row.code_used_at) : null
      }));

      set({ applications, loading: false, initialized: true });
    } catch (error) {
      console.error('Load applications error:', error);
      set({ loading: false });
    }
  },

  // 신청서 제출 (기수 선택 없음)
  submitApplication: async (data) => {
    try {
      const { error } = await supabase
        .from('applications')
        .insert({
          name: data.name,
          email: data.email,
          phone_number: data.phone,
          motivation: data.motivation,
          status: 'pending'
        });

      if (error) {
        console.error('Failed to submit application:', error);
        throw new Error('신청서 제출에 실패했습니다');
      }

      // Note: SELECT 권한이 어드민에게만 있으므로 로컬 상태 업데이트 생략
      // 신청서는 어드민 페이지에서만 조회 가능
    } catch (error) {
      console.error('Submit application error:', error);
      throw error;
    }
  },

  // 신청 승인 (Edge Function 사용)
  approveApplication: async (applicationId, cohortId) => {
    try {
      // 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('로그인이 필요합니다');
      }

      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke('admin-approve', {
        body: { applicationId, cohortId },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error || !data || !data.success) {
        console.error('Failed to approve application:', error);
        throw new Error(data?.error || '신청서 승인에 실패했습니다');
      }

      // 로컬 상태 업데이트
      const updatedApplications = get().applications.map(app =>
        app.id === applicationId
          ? {
              ...app,
              status: 'approved' as const,
              code: data.code,
              cohortId,
              processedAt: new Date()
            }
          : app
      );

      set({ applications: updatedApplications });

      // 승인 이메일 발송 (NHN Cloud via Edge Function)
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke(
          'send-approval-email',
          {
            body: {
              applicationId,
              code: data.code,
              cohortId
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        );

        if (emailError || !emailData?.success) {
          console.error('Failed to send approval email:', emailError || emailData?.error);
          // 이메일 실패해도 승인은 완료 (로그만 기록)
          // TODO: 관리자에게 알림 또는 수동 재발송 UI 제공
        } else {
          console.log('✅ Approval email sent successfully:', emailData.requestId);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // 이메일 발송 실패해도 계속 진행 (승인은 이미 완료됨)
      }

      return data.code;
    } catch (error) {
      console.error('Approve application error:', error);
      throw error;
    }
  },

  // 신청 거절
  rejectApplication: async (applicationId) => {
    try {
      // 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('로그인이 필요합니다');
      }

      // 신청자 정보 조회 (알림 발송용)
      const application = get().applications.find(app => app.id === applicationId);

      // DB 업데이트
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'rejected',
          processed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Failed to reject application:', error);
        return;
      }

      // 로컬 상태 업데이트
      const applications = get().applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'rejected' as const, processedAt: new Date() }
          : app
      );

      set({ applications });

      // 거절 알림 발송 (Email + SMS)
      if (application) {
        try {
          const { data: notificationData, error: notificationError } = await supabase.functions.invoke(
            'send-notification',
            {
              body: {
                // No userId - application doesn't have user account yet
                type: 'application_rejection',
                channels: ['email', 'sms'],
                data: {
                  name: application.name,
                  email: application.email,
                  phone_number: application.phone
                }
              },
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            }
          );

          if (notificationError || !notificationData?.success) {
            console.error('Failed to send rejection notification:', notificationError || notificationData?.error);
          } else {
            console.log('✅ Rejection notification sent successfully');
          }
        } catch (notificationError) {
          console.error('Notification sending error:', notificationError);
        }
      }
    } catch (error) {
      console.error('Reject application error:', error);
    }
  },

  // 코드 검증 (Edge Function 사용)
  verifyCode: async (code) => {
    try {
      const upperCode = code.toUpperCase();

      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: { code: upperCode }
      });

      if (error) {
        console.error('Edge Function error:', error);
        return { valid: false };
      }

      // Edge Function 응답 처리
      if (!data || !data.valid) {
        return { valid: false };
      }

      return {
        valid: true,
        cohortId: data.cohortId,
        applicationId: data.applicationId,
        phoneNumber: data.phoneNumber
      };
    } catch (error) {
      console.error('Verify code error:', error);
      return { valid: false };
    }
  },

  // 코드 사용 처리
  markCodeAsUsed: async (code) => {
    try {
      const upperCode = code.toUpperCase();

      // TEST01 코드는 무시 (테스트용)
      if (upperCode === 'TEST01') {
        return;
      }

      const { error } = await supabase
        .from('applications')
        .update({
          code_used_at: new Date().toISOString()
        })
        .eq('code', upperCode);

      if (error) {
        console.error('Failed to mark code as used:', error);
        return;
      }

      // 로컬 상태 업데이트
      const applications = get().applications.map(app =>
        app.code === upperCode
          ? { ...app, codeUsedAt: new Date() }
          : app
      );

      set({ applications });
    } catch (error) {
      console.error('Mark code as used error:', error);
    }
  },

  // 상태별 신청서 조회
  getApplicationsByStatus: (status) => {
    return get().applications.filter(app => app.status === status);
  },

  // 기수별 신청서 조회
  getApplicationsByCohort: (cohortId) => {
    return get().applications.filter(app => app.cohortId === cohortId);
  }
}));
