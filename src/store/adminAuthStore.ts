import { create } from 'zustand';

interface AdminAuthStore {
  isAdminLoggedIn: boolean;
  adminEmail: string | null;

  // Actions
  adminLogin: (email: string, password: string) => { success: boolean; error?: string };
  adminLogout: () => void;
  checkAdminAuth: () => void;
}

const ADMIN_AUTH_KEY = 'admin-auth';

// 하드코딩된 어드민 계정
const ADMIN_CREDENTIALS = {
  email: 'admin@emotional-shower.com',
  password: 'admin1234'
};

// 어드민 인증 정보 저장
const saveAdminAuth = (email: string) => {
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify({ email, timestamp: Date.now() }));
  } catch (error) {
    console.error('Failed to save admin auth:', error);
  }
};

// 어드민 인증 정보 제거
const clearAdminAuth = () => {
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  } catch (error) {
    console.error('Failed to clear admin auth:', error);
  }
};

// 어드민 인증 정보 로드
const loadAdminAuth = (): string | null => {
  try {
    const stored = localStorage.getItem(ADMIN_AUTH_KEY);
    if (stored) {
      const { email } = JSON.parse(stored);
      return email;
    }
  } catch (error) {
    console.error('Failed to load admin auth:', error);
  }
  return null;
};

export const useAdminAuthStore = create<AdminAuthStore>((set) => {
  const adminEmail = loadAdminAuth();

  return {
    isAdminLoggedIn: !!adminEmail,
    adminEmail,

    // 어드민 로그인
    adminLogin: (email, password) => {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        saveAdminAuth(email);
        set({ isAdminLoggedIn: true, adminEmail: email });
        return { success: true };
      }
      return { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다' };
    },

    // 어드민 로그아웃
    adminLogout: () => {
      clearAdminAuth();
      set({ isAdminLoggedIn: false, adminEmail: null });
    },

    // 어드민 인증 상태 확인
    checkAdminAuth: () => {
      const email = loadAdminAuth();
      set({ isAdminLoggedIn: !!email, adminEmail: email });
    }
  };
});
