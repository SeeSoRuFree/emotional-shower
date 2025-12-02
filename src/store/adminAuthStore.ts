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

  // 어드민 로그인 (Supabase Auth 사용)
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

      // users 테이블에서 is_admin 확인
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, is_admin')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData || !userData.is_admin) {
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
        adminEmail: userData.email,
        adminId: userData.id,
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
    try {
      set({ loading: true });

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        set({
          isAdminLoggedIn: false,
          adminEmail: null,
          adminId: null,
          loading: false
        });
        return;
      }

      // users 테이블에서 is_admin 확인
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, is_admin')
        .eq('id', session.user.id)
        .single();

      if (userError || !userData || !userData.is_admin) {
        // 어드민이 아니면 로그아웃
        await supabase.auth.signOut();
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
        adminEmail: userData.email,
        adminId: userData.id,
        loading: false
      });
    } catch (error) {
      console.error('Check admin auth error:', error);
      set({
        isAdminLoggedIn: false,
        adminEmail: null,
        adminId: null,
        loading: false
      });
    }
  }
}));
