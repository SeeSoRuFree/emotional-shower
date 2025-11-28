import { create } from 'zustand';

// 신청자 정보
export interface Application {
  id: string;           // 고유 ID (timestamp)
  name: string;
  email: string;
  motivation: string;
  cohortId: string | null;     // 승인 시 어드민이 할당하는 기수
  status: 'pending' | 'approved' | 'rejected';
  code: string | null;  // 승인 시 발급되는 코드
  appliedAt: Date;
  processedAt: Date | null;  // 승인/거절 처리 시간
}

// 코드-기수 매핑
export interface CodeMapping {
  code: string;
  cohortId: string;
  applicationId: string;
  isUsed: boolean;
  usedAt: Date | null;
}

interface ApplicationStore {
  applications: Application[];
  codeMappings: CodeMapping[];

  // Actions
  submitApplication: (data: { name: string; email: string; motivation: string }) => void;
  approveApplication: (applicationId: string, cohortId: string) => string;  // Returns code
  rejectApplication: (applicationId: string) => void;
  verifyCode: (code: string) => { valid: boolean; cohortId?: string; applicationId?: string };
  markCodeAsUsed: (code: string) => void;
  getApplicationsByStatus: (status: Application['status']) => Application[];
  getApplicationsByCohort: (cohortId: string) => Application[];
}

const STORAGE_KEY = 'kindness-applications';
const CODE_STORAGE_KEY = 'kindness-codes';

// 6자리 랜덤 코드 생성
const generateCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// LocalStorage에서 로드
const loadFromStorage = () => {
  try {
    const applicationsData = localStorage.getItem(STORAGE_KEY);
    const codesData = localStorage.getItem(CODE_STORAGE_KEY);

    const parsed = {
      applications: applicationsData ? JSON.parse(applicationsData).map((app: any) => ({
        ...app,
        appliedAt: new Date(app.appliedAt),
        processedAt: app.processedAt ? new Date(app.processedAt) : null
      })) : [],
      codeMappings: codesData ? JSON.parse(codesData).map((code: any) => ({
        ...code,
        usedAt: code.usedAt ? new Date(code.usedAt) : null
      })) : []
    };

    return parsed;
  } catch (error) {
    console.error('Failed to load applications from storage:', error);
    return { applications: [], codeMappings: [] };
  }
};

// LocalStorage에 저장
const saveToStorage = (applications: Application[], codeMappings: CodeMapping[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(codeMappings));
  } catch (error) {
    console.error('Failed to save applications to storage:', error);
  }
};

export const useApplicationStore = create<ApplicationStore>((set, get) => {
  const { applications: storedApps, codeMappings: storedCodes } = loadFromStorage();

  // 초기화: 테스트용 코드가 없으면 생성
  if (!storedCodes.some(code => code.code === 'TEST01')) {
    const testCodeMapping: CodeMapping = {
      code: 'TEST01',
      cohortId: 'cohort-1',
      applicationId: 'test-application',
      isUsed: false,
      usedAt: null
    };
    storedCodes.push(testCodeMapping);
    saveToStorage(storedApps, storedCodes);
  }

  return {
    applications: storedApps,
    codeMappings: storedCodes,

    // 신청서 제출 (기수 선택 없음)
    submitApplication: (data) => {
      const newApplication: Application = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        motivation: data.motivation,
        cohortId: null,  // 어드민이 승인 시 할당
        status: 'pending',
        code: null,
        appliedAt: new Date(),
        processedAt: null
      };

      const applications = [...get().applications, newApplication];
      set({ applications });
      saveToStorage(applications, get().codeMappings);
    },

    // 신청 승인 (코드 발급 + 기수 할당)
    approveApplication: (applicationId, cohortId) => {
      const applications = get().applications;
      const application = applications.find(app => app.id === applicationId);

      if (!application) {
        throw new Error('Application not found');
      }

      // 고유한 코드 생성
      let code = generateCode();
      while (get().codeMappings.some(mapping => mapping.code === code)) {
        code = generateCode();
      }

      // 신청서 상태 업데이트 (기수 할당)
      const updatedApplications = applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'approved' as const, code, cohortId, processedAt: new Date() }
          : app
      );

      // 코드 매핑 추가
      const newCodeMapping: CodeMapping = {
        code,
        cohortId,
        applicationId: application.id,
        isUsed: false,
        usedAt: null
      };

      const codeMappings = [...get().codeMappings, newCodeMapping];

      set({ applications: updatedApplications, codeMappings });
      saveToStorage(updatedApplications, codeMappings);

      // 이메일 발송 시뮬레이션
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

      return code;
    },

    // 신청 거절
    rejectApplication: (applicationId) => {
      const applications = get().applications.map(app =>
        app.id === applicationId
          ? { ...app, status: 'rejected' as const, processedAt: new Date() }
          : app
      );

      set({ applications });
      saveToStorage(applications, get().codeMappings);
    },

    // 코드 검증
    verifyCode: (code) => {
      const mapping = get().codeMappings.find(m => m.code === code.toUpperCase());

      if (!mapping) {
        return { valid: false };
      }

      if (mapping.isUsed) {
        return { valid: false };
      }

      return {
        valid: true,
        cohortId: mapping.cohortId,
        applicationId: mapping.applicationId
      };
    },

    // 코드 사용 처리
    markCodeAsUsed: (code) => {
      const codeMappings = get().codeMappings.map(mapping =>
        mapping.code === code.toUpperCase()
          ? { ...mapping, isUsed: true, usedAt: new Date() }
          : mapping
      );

      set({ codeMappings });
      saveToStorage(get().applications, codeMappings);
    },

    // 상태별 신청서 조회
    getApplicationsByStatus: (status) => {
      return get().applications.filter(app => app.status === status);
    },

    // 기수별 신청서 조회
    getApplicationsByCohort: (cohortId) => {
      return get().applications.filter(app => app.cohortId === cohortId);
    }
  };
});
