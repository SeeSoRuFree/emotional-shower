// SMS Templates for Notifications
// All templates return plain text messages (max 90 bytes for SMS, 2000 bytes for LMS)

export interface ApplicationApprovalSMSData {
  name: string;
  code: string;
}

export interface ApplicationRejectionSMSData {
  name: string;
}

export interface MilestoneReachedSMSData {
  name: string;
  day: number;
}

export interface ChallengeCompleteSMSData {
  name: string;
  stamps: number;
}

export const smsTemplates = {
  /**
   * Application Approval SMS
   * 신청 승인 시 발송 (인증 코드 포함)
   */
  applicationApproval: (data: ApplicationApprovalSMSData): string =>
    `[정서샤워] ${data.name}님, 챌린지가 승인되었습니다! 인증코드: ${data.code}`,

  /**
   * Application Rejection SMS
   * 신청 거절 시 발송
   */
  applicationRejection: (data: ApplicationRejectionSMSData): string =>
    `[정서샤워] ${data.name}님, 신청해주셔서 감사합니다. 다음 기수 모집 시 다시 안내드리겠습니다.`,

  /**
   * Challenge Start SMS
   * 챌린지 시작 시 발송 (사전 설문 완료 후)
   */
  challengeStart: (name: string): string =>
    `[정서샤워] ${name}님, 30일 친절 챌린지가 시작되었습니다! 오늘부터 첫 번째 기록을 남겨보세요.`,

  /**
   * Daily Record Reminder SMS
   * 일일 기록 리마인더 (매일 저녁 8시)
   */
  dailyReminder: (name: string, day: number): string =>
    `[정서샤워] ${name}님, DAY ${day} 기록 시간입니다. 오늘의 친절을 기록해주세요!`,

  /**
   * Challenge Completion SMS
   * 챌린지 완료 시 발송 (≥22 stamps)
   */
  challengeComplete: (data: ChallengeCompleteSMSData): string =>
    `[정서샤워] ${data.name}님, 축하합니다! 30일 챌린지를 완료하셨습니다 (${data.stamps}/30). 사후 설문을 완료해주세요.`,

  /**
   * Challenge Failure SMS
   * 챌린지 실패 시 발송 (<22 stamps)
   */
  challengeFailure: (name: string, stamps: number): string =>
    `[정서샤워] ${name}님, 챌린지가 종료되었습니다 (${stamps}/30). 다음 기수에서 다시 도전해보세요!`,

  /**
   * Milestone Reached SMS
   * 마일스톤 달성 시 발송 (Day 7, 15, 22)
   */
  milestoneReached: (data: MilestoneReachedSMSData): string =>
    `[정서샤워] ${data.name}님, ${data.day}일 달성을 축하합니다! 계속 멋진 여정을 이어가세요!`,

  /**
   * Pre-Survey Reminder SMS
   * 사전 설문 리마인더 (승인 후 24-48시간)
   */
  preSurveyReminder: (name: string): string =>
    `[정서샤워] ${name}님, 챌린지 시작을 위해 사전 설문을 완료해주세요!`,

  /**
   * Post-Survey Reminder SMS
   * 사후 설문 리마인더 (챌린지 완료 후 24-48시간)
   */
  postSurveyReminder: (name: string): string =>
    `[정서샤워] ${name}님, 챌린지 리포트를 받으려면 사후 설문을 완료해주세요!`,
};
