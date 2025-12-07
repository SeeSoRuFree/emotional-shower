import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface AdminAuthStore {
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  adminId: string | null;
  loading: boolean;

  // Actions
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
  checkAdminAuth: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  isAdminLoggedIn: false,
  adminEmail: null,
  adminId: null,
  loading: false,

  // 어드민 로그인 (임시: DB 직접 체크)
  adminLogin: async (email, password) => {
    try {
      set({ loading: true });

      // Supabase Auth로 로그인
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        set({ loading: false });
        return {
          success: false,
          error: authError?.message || '이메일 또는 비밀번호가 일치하지 않습니다'
        };
      }

      // 임시: admins 테이블 직접 조회
      // TODO: Edge Function 배포 완료 후 원래 로직으로 복구
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('user_id, role')
        .eq('user_id', authData.user.id)
        .single();

      if (adminError || !adminData) {
        // 어드민이 아니면 로그아웃
        await supabase.auth.signOut();
        set({ loading: false });
        return {
          success: false,
          error: '관리자 권한이 없습니다'
        };
      }

      set({
        isAdminLoggedIn: true,
        adminEmail: authData.user.email || email,
        adminId: authData.user.id,
        loading: false
      });

      return { success: true };
    } catch (error: any) {
      set({ loading: false });
      console.error('Admin login error:', error);
      return {
        success: false,
        error: error.message || '로그인 중 오류가 발생했습니다'
      };
    }
  },

  // 어드민 로그아웃
  adminLogout: async () => {
    try {
      await supabase.auth.signOut();
      set({
        isAdminLoggedIn: false,
        adminEmail: null,
        adminId: null
      });
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  },

  // 어드민 인증 상태 확인
  checkAdminAuth: async () => {
    const AUTH_TIMEOUT = 10000; // 10초 timeout

    const adminAuthCheck = async () => {
      console.log('[checkAdminAuth] 시작');
      set({ loading: true });

      console.log('[checkAdminAuth] getSession 호출');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[checkAdminAuth] getSession 완료:', !!session);

      if (!session) {
        set({
          isAdminLoggedIn: false,
          adminEmail: null,
          adminId: null,
          loading: false
        });
        return;
      }

      // 세션이 있으면 admins 테이블 확인
      console.log('[checkAdminAuth] admins 테이블 쿼리 시작');
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('user_id, role')
        .eq('user_id', session.user.id)
        .single();
      console.log('[checkAdminAuth] admins 테이블 쿼리 완료:', !!adminData, adminError?.message);

      if (adminError || !adminData) {
        // 어드민이 아니면 상태 초기화
        set({
          isAdminLoggedIn: false,
          adminEmail: null,
          adminId: null,
          loading: false
        });
        return;
      }

      set({
        isAdminLoggedIn: true,
        adminEmail: session.user.email || null,
        adminId: session.user.id,
        loading: false
      });
      console.log('[checkAdminAuth] 완료');
    };

    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Admin auth check timeout')), AUTH_TIMEOUT)
    );

    try {
      await Promise.race([adminAuthCheck(), timeoutPromise]);
    } catch (error) {
      console.error('Check admin auth error or timeout:', error);
      set({
        isAdminLoggedIn: false,
        adminEmail: null,
        adminId: null,
        loading: false
      });
    }
  }
}));
