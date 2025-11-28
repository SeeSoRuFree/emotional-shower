import { create } from 'zustand';

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
  password: string; // 실제로는 해시화해야 하지만 프로토타입이므로 평문
  currentCohortId: string | null;  // 현재 활성 기수
  cohortHistory: CohortParticipation[];  // 과거 참여 이력
  createdAt: Date;
}

interface AuthStore {
  currentUser: User | null;
  isLoggedIn: boolean;

  // Actions
  signup: (data: { name: string; email: string; password: string; cohortId: string }) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  checkAuth: () => void;
  joinCohort: (cohortId: string) => { success: boolean; error?: string };  // 기존 사용자가 새 기수 참여
  completeCohort: (cohortId: string, status: 'completed' | 'failed') => void;  // 기수 완료 처리
  hasActiveCohort: () => boolean;  // 현재 진행 중인 기수가 있는지 확인
}

const STORAGE_KEY = 'kindness-users';
const AUTH_KEY = 'kindness-auth';

// LocalStorage에서 사용자 목록 로드
const loadUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored).map((user: any) => ({
        ...user,
        createdAt: new Date(user.createdAt),
        cohortHistory: user.cohortHistory?.map((ch: any) => ({
          ...ch,
          joinedAt: new Date(ch.joinedAt),
          completedAt: ch.completedAt ? new Date(ch.completedAt) : null
        })) || []
      }));
    }
  } catch (error) {
    console.error('Failed to load users:', error);
  }
  return [];
};

// LocalStorage에 사용자 목록 저장
const saveUsers = (users: User[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save users:', error);
  }
};

// 현재 인증된 사용자 로드
const loadCurrentUser = (): User | null => {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (authData) {
      const { userId } = JSON.parse(authData);
      const users = loadUsers();
      const user = users.find(u => u.id === userId);
      return user || null;
    }
  } catch (error) {
    console.error('Failed to load current user:', error);
  }
  return null;
};

// 인증 정보 저장
const saveAuth = (userId: string) => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ userId }));
    localStorage.setItem('isLoggedIn', 'true');
  } catch (error) {
    console.error('Failed to save auth:', error);
  }
};

// 인증 정보 제거
const clearAuth = () => {
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('isLoggedIn');
  } catch (error) {
    console.error('Failed to clear auth:', error);
  }
};

export const useAuthStore = create<AuthStore>((set, get) => {
  const currentUser = loadCurrentUser();

  // 초기화: 테스트 계정이 없으면 생성
  const users = loadUsers();
  if (!users.some(u => u.email === 'test@test.com')) {
    const testUser: User = {
      id: 'test-user-1',
      name: '테스트 유저',
      email: 'test@test.com',
      password: 'test123',
      currentCohortId: 'cohort-1',
      cohortHistory: [
        {
          cohortId: 'cohort-1',
          joinedAt: new Date(),
          completedAt: null,
          status: 'active'
        }
      ],
      createdAt: new Date()
    };
    saveUsers([...users, testUser]);
  }

  return {
    currentUser,
    isLoggedIn: !!currentUser,

    // 회원가입
    signup: (data) => {
      const users = loadUsers();

      // 이메일 중복 확인
      if (users.some(u => u.email === data.email)) {
        return { success: false, error: '이미 가입된 이메일입니다' };
      }

      // 새 사용자 생성
      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        password: data.password,
        currentCohortId: data.cohortId,
        cohortHistory: [
          {
            cohortId: data.cohortId,
            joinedAt: new Date(),
            completedAt: null,
            status: 'active'
          }
        ],
        createdAt: new Date()
      };

      // 저장
      users.push(newUser);
      saveUsers(users);

      // 자동 로그인
      saveAuth(newUser.id);
      set({ currentUser: newUser, isLoggedIn: true });

      return { success: true };
    },

    // 로그인
    login: (email, password) => {
      const users = loadUsers();
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다' };
      }

      saveAuth(user.id);
      set({ currentUser: user, isLoggedIn: true });

      return { success: true };
    },

    // 로그아웃
    logout: () => {
      clearAuth();
      set({ currentUser: null, isLoggedIn: false });
    },

    // 인증 상태 확인 (앱 시작 시)
    checkAuth: () => {
      const user = loadCurrentUser();
      set({ currentUser: user, isLoggedIn: !!user });
    },

    // 기존 사용자가 새 기수 참여
    joinCohort: (cohortId) => {
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

      // 새 기수 참여 기록 추가
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

      // 저장
      const users = loadUsers();
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      saveUsers(updatedUsers);

      set({ currentUser: updatedUser });

      return { success: true };
    },

    // 기수 완료 처리
    completeCohort: (cohortId, status) => {
      const { currentUser } = get();
      if (!currentUser) return;

      const updatedHistory = currentUser.cohortHistory.map(ch =>
        ch.cohortId === cohortId
          ? { ...ch, status, completedAt: new Date() }
          : ch
      );

      const updatedUser: User = {
        ...currentUser,
        currentCohortId: null,  // 현재 기수 해제
        cohortHistory: updatedHistory
      };

      // 저장
      const users = loadUsers();
      const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
      saveUsers(updatedUsers);

      set({ currentUser: updatedUser });
    },

    // 현재 진행 중인 기수가 있는지 확인
    hasActiveCohort: () => {
      const { currentUser } = get();
      if (!currentUser) return false;

      return currentUser.cohortHistory.some(
        ch => ch.status === 'active'
      );
    }
  };
});
