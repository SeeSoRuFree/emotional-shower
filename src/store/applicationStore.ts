import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useCohortStore } from './cohortStore';

// 신청자 정보
export interface Application {
  id: string;           // 고유 ID (UUID from Supabase)
  name: string;
  email: string;
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
  submitApplication: (data: { name: string; email: string; motivation: string }) => Promise<void>;
  approveApplication: (applicationId: string, cohortId: string) => Promise<string>;  // Returns code
  rejectApplication: (applicationId: string) => Promise<void>;
  verifyCode: (code: string) => Promise<{ valid: boolean; cohortId?: string; applicationId?: string }>;
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

  // Supabase에서 신청서 로드
  loadApplications: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Failed to load applications:', error);
        set({ loading: false });
        return;
      }

      const applications: Application[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
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
      const { data: newApp, error } = await supabase
        .from('applications')
        .insert({
          name: data.name,
          email: data.email,
          motivation: data.motivation,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to submit application:', error);
        return;
      }

      const application: Application = {
        id: newApp.id,
        name: newApp.name,
        email: newApp.email,
        motivation: newApp.motivation,
        cohortId: null,
        status: 'pending',
        code: null,
        appliedAt: new Date(newApp.applied_at),
        processedAt: null,
        codeUsedAt: null
      };

      set({ applications: [...get().applications, application] });
    } catch (error) {
      console.error('Submit application error:', error);
    }
  },

  // 신청 승인 (코드 발급 + 기수 할당)
  approveApplication: async (applicationId, cohortId) => {
    try {
      // 고유한 코드 생성
      let code = generateCode();
      let isUnique = false;

      // 코드 중복 확인
      while (!isUnique) {
        const { data: existing } = await supabase
          .from('applications')
          .select('code')
          .eq('code', code)
          .single();

        if (!existing) {
          isUnique = true;
        } else {
          code = generateCode();
        }
      }

      // 신청서 상태 업데이트 (기수 할당)
      const { data: updated, error } = await supabase
        .from('applications')
        .update({
          status: 'approved',
          code: code,
          cohort_id: cohortId,
          processed_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        console.error('Failed to approve application:', error);
        throw new Error('Failed to approve application');
      }

      // 로컬 상태 업데이트
      const updatedApplications = get().applications.map(app =>
        app.id === applicationId
          ? {
              ...app,
              status: 'approved' as const,
              code,
              cohortId,
              processedAt: new Date(updated.processed_at)
            }
          : app
      );

      set({ applications: updatedApplications });

      // 이메일 발송 시뮬레이션
      const application = get().applications.find(app => app.id === applicationId);
      if (application) {
        console.log(`
📧 이메일 발송 시뮬레이션
━━━━━━━━━━━━━━━━━━━━
To: ${application.email}
Subject: [정서샤워] 챌린지 승인 안내

안녕하세요 ${application.name}님,

신청하신 챌린지가 승인되었습니다!
아래 코드로 회원가입을 진행해주세요.

인증 코드: ${code}
할당 기수: ${cohortId}

감사합니다.
        `);
      }

      return code;
    } catch (error) {
      console.error('Approve application error:', error);
      throw error;
    }
  },

  // 신청 거절
  rejectApplication: async (applicationId) => {
    try {
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

      const applications = get().applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'rejected' as const, processedAt: new Date() }
          : app
      );

      set({ applications });
    } catch (error) {
      console.error('Reject application error:', error);
    }
  },

  // 코드 검증
  verifyCode: async (code) => {
    try {
      const upperCode = code.toUpperCase();

      // TEST01 코드의 경우, cohortStore에서 실제 UUID 가져오기
      if (upperCode === 'TEST01') {
        try {
          const cohortStore = useCohortStore.getState();
          const actualCohortId = await cohortStore.ensureTestCohort();

          return {
            valid: true,
            cohortId: actualCohortId,
            applicationId: 'test-application'
          };
        } catch (error) {
          console.error('Failed to get test cohort UUID:', error);
          return { valid: false };
        }
      }

      // Supabase에서 코드 검증
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('code', upperCode)
        .eq('status', 'approved')
        .single();

      if (error || !data) {
        return { valid: false };
      }

      // 이미 사용된 코드인지 확인
      if (data.code_used_at) {
        return { valid: false };
      }

      return {
        valid: true,
        cohortId: data.cohort_id,
        applicationId: data.id
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
