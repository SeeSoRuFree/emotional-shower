import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// 기수 참여 이력
export interface CohortParticipation {
  cohortId: string;
  joinedAt: Date;
  completedAt: Date | null;
  status: 'active' | 'completed' | 'failed';
}

// 회원 정보
export interface User {
  id: string;
  name: string;
  email: string;
  currentCohortId: string | null;
  cohortHistory: CohortParticipation[];
  createdAt: Date;
}

interface AuthStore {
  currentUser: User | null;
  isLoggedIn: boolean;
  loading: boolean;

  // Actions
  signup: (data: { name: string; email: string; password: string; cohortId: string }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  joinCohort: (cohortId: string) => Promise<{ success: boolean; error?: string }>;
  completeCohort: (cohortId: string, status: 'completed' | 'failed') => Promise<void>;
  hasActiveCohort: () => boolean;
}

// Supabase 에러를 한국어로 변환
const translateError = (error: any): string => {
  if (error.message?.includes('already registered')) {
    return '이미 가입된 이메일입니다';
  }
  if (error.message?.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 일치하지 않습니다';
  }
  if (error.message?.includes('Email not confirmed')) {
    return '이메일 인증이 필요합니다';
  }
  if (error.message?.includes('User already registered')) {
    return '이미 가입된 이메일입니다';
  }
  return error.message || '오류가 발생했습니다';
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  currentUser: null,
  isLoggedIn: false,
  loading: false,

  // 회원가입
  signup: async (data) => {
    try {
      set({ loading: true });

      // 1. Supabase Auth에 가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: data.name
          }
        }
      });

      if (authError) {
        set({ loading: false });
        return { success: false, error: translateError(authError) };
      }

      if (!authData.user) {
        set({ loading: false });
        return { success: false, error: '회원가입에 실패했습니다' };
      }

      // 2. users 테이블에 프로필 저장
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: data.name,
          email: data.email,
          current_cohort_id: data.cohortId
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        set({ loading: false });
        // Note: Auth user was created but profile failed.
        // User should contact support or try logging in again.
        return {
          success: false,
          error: '프로필 생성에 실패했습니다. 이미 가입이 완료되었을 수 있습니다. 로그인을 시도해보세요.'
        };
      }

      // 3. user_cohorts에 참여 기록 추가
      const { error: cohortError } = await supabase
        .from('user_cohorts')
        .insert({
          user_id: authData.user.id,
          cohort_id: data.cohortId,
          status: 'active'
        });

      if (cohortError) {
        console.error('Cohort enrollment error:', cohortError);
        set({ loading: false });
        // Profile exists but cohort enrollment failed
        // User can still log in, but should contact support
        return {
          success: false,
          error: '기수 참여 등록에 실패했습니다. 계정은 생성되었으니 로그인 후 다시 시도해주세요.'
        };
      }

      // 4. user_cohorts 조회 (cohortHistory)
      const { data: cohortHistory } = await supabase
        .from('user_cohorts')
        .select('*')
        .eq('user_id', authData.user.id);

      // 5. 현재 사용자 설정
      const currentUser: User = {
        id: authData.user.id,
        name: data.name,
        email: data.email,
        currentCohortId: data.cohortId,
        cohortHistory: cohortHistory?.map(ch => ({
          cohortId: ch.cohort_id,
          joinedAt: new Date(ch.joined_at),
          completedAt: ch.completed_at ? new Date(ch.completed_at) : null,
          status: ch.status as 'active' | 'completed' | 'failed'
        })) || [],
        createdAt: new Date()
      };

      set({ currentUser, isLoggedIn: true, loading: false });
      return { success: true };
    } catch (error: any) {
      console.error('Signup error:', error);
      set({ loading: false });
      return { success: false, error: translateError(error) };
    }
  },

  // 로그인
  login: async (email, password) => {
    try {
      set({ loading: true });

      // 1. Supabase Auth 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        set({ loading: false });
        return { success: false, error: translateError(authError) };
      }

      if (!authData.user) {
        set({ loading: false });
        return { success: false, error: '로그인에 실패했습니다' };
      }

      // 2. users 테이블에서 프로필 가져오기
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        set({ loading: false });
        return { success: false, error: '사용자 정보를 불러올 수 없습니다' };
      }

      // 3. user_cohorts 조회 (cohortHistory)
      const { data: cohortHistory } = await supabase
        .from('user_cohorts')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('joined_at', { ascending: false });

      // 4. 현재 사용자 설정
      const currentUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        currentCohortId: profile.current_cohort_id,
        cohortHistory: cohortHistory?.map(ch => ({
          cohortId: ch.cohort_id,
          joinedAt: new Date(ch.joined_at),
          completedAt: ch.completed_at ? new Date(ch.completed_at) : null,
          status: ch.status as 'active' | 'completed' | 'failed'
        })) || [],
        createdAt: new Date(profile.created_at)
      };

      set({ currentUser, isLoggedIn: true, loading: false });
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      set({ loading: false });
      return { success: false, error: translateError(error) };
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ currentUser: null, isLoggedIn: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // 인증 상태 확인 (앱 시작 시)
  checkAuth: async () => {
    try {
      set({ loading: true });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        set({ currentUser: null, isLoggedIn: false, loading: false });
        return;
      }

      // users 테이블에서 프로필 가져오기
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        set({ currentUser: null, isLoggedIn: false, loading: false });
        return;
      }

      // user_cohorts 조회
      const { data: cohortHistory } = await supabase
        .from('user_cohorts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('joined_at', { ascending: false });

      const currentUser: User = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        currentCohortId: profile.current_cohort_id,
        cohortHistory: cohortHistory?.map(ch => ({
          cohortId: ch.cohort_id,
          joinedAt: new Date(ch.joined_at),
          completedAt: ch.completed_at ? new Date(ch.completed_at) : null,
          status: ch.status as 'active' | 'completed' | 'failed'
        })) || [],
        createdAt: new Date(profile.created_at)
      };

      set({ currentUser, isLoggedIn: true, loading: false });
    } catch (error) {
      console.error('Check auth error:', error);
      set({ currentUser: null, isLoggedIn: false, loading: false });
    }
  },

  // 기존 사용자가 새 기수 참여
  joinCohort: async (cohortId) => {
    try {
      const { currentUser } = get();
      if (!currentUser) {
        return { success: false, error: '로그인이 필요합니다' };
      }

      // 이미 진행 중인 기수가 있는지 확인
      if (currentUser.currentCohortId) {
        const activeCohort = currentUser.cohortHistory.find(
          ch => ch.cohortId === currentUser.currentCohortId && ch.status === 'active'
        );
        if (activeCohort) {
          return { success: false, error: '이미 진행 중인 기수가 있습니다' };
        }
      }

      // user_cohorts에 새 참여 추가
      const { error: cohortError } = await supabase
        .from('user_cohorts')
        .insert({
          user_id: currentUser.id,
          cohort_id: cohortId,
          status: 'active'
        });

      if (cohortError) {
        return { success: false, error: '기수 참여에 실패했습니다' };
      }

      // users 테이블의 current_cohort_id 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update({ current_cohort_id: cohortId })
        .eq('id', currentUser.id);

      if (updateError) {
        return { success: false, error: '현재 기수 설정에 실패했습니다' };
      }

      // 상태 업데이트
      const newParticipation: CohortParticipation = {
        cohortId,
        joinedAt: new Date(),
        completedAt: null,
        status: 'active'
      };

      const updatedUser: User = {
        ...currentUser,
        currentCohortId: cohortId,
        cohortHistory: [...currentUser.cohortHistory, newParticipation]
      };

      set({ currentUser: updatedUser });
      return { success: true };
    } catch (error: any) {
      console.error('Join cohort error:', error);
      return { success: false, error: translateError(error) };
    }
  },

  // 기수 완료 처리
  completeCohort: async (cohortId, status) => {
    try {
      const { currentUser } = get();
      if (!currentUser) return;

      // user_cohorts 업데이트
      const { error } = await supabase
        .from('user_cohorts')
        .update({
          status,
          completed_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id)
        .eq('cohort_id', cohortId);

      if (error) {
        console.error('Complete cohort error:', error);
        return;
      }

      // users 테이블의 current_cohort_id 제거
      await supabase
        .from('users')
        .update({ current_cohort_id: null })
        .eq('id', currentUser.id);

      // 상태 업데이트
      const updatedHistory = currentUser.cohortHistory.map(ch =>
        ch.cohortId === cohortId
          ? { ...ch, status, completedAt: new Date() }
          : ch
      );

      const updatedUser: User = {
        ...currentUser,
        currentCohortId: null,
        cohortHistory: updatedHistory
      };

      set({ currentUser: updatedUser });
    } catch (error) {
      console.error('Complete cohort error:', error);
    }
  },

  // 현재 진행 중인 기수가 있는지 확인
  hasActiveCohort: () => {
    const { currentUser } = get();
    if (!currentUser) return false;

    return currentUser.cohortHistory.some(ch => ch.status === 'active');
  }
}));
