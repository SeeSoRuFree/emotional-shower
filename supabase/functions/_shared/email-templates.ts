// Email Templates for Notifications
// All templates return { subject, body } with HTML body

export interface ApplicationApprovalData {
  applicantName: string;
  code: string;
  cohortName: string;
  cohortStartDate: string;
}

export interface ChallengeStartData {
  name: string;
  cohortName: string;
}

export interface ChallengeCompleteData {
  name: string;
  stamps: number;
}

export interface MilestoneReachedData {
  name: string;
  day: number;
}

export interface DailyReminderData {
  name: string;
  day: number;
}

export const emailTemplates = {
  /**
   * Application Approval Email Template
   * Sent when admin approves a challenge application with verification code
   */
  applicationApproval: (data: ApplicationApprovalData) => ({
    subject: '[정서샤워] 챌린지 승인 안내',
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', 'Malgun Gothic', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f7f9fc;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #4A90E2;
    }
    .header h1 {
      color: #4A90E2;
      font-size: 24px;
      margin: 0;
    }
    .content {
      margin: 30px 0;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 20px;
    }
    .message {
      font-size: 15px;
      color: #555;
      margin-bottom: 30px;
    }
    .code-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin: 30px 0;
    }
    .code-label {
      color: #ffffff;
      font-size: 14px;
      margin-bottom: 10px;
      opacity: 0.9;
    }
    .code {
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 4px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #4A90E2;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 14px;
    }
    .info-box strong {
      color: #2c3e50;
    }
    .next-steps {
      background-color: #fff9e6;
      border: 1px solid #ffd93d;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .next-steps h3 {
      color: #f39c12;
      font-size: 16px;
      margin-top: 0;
    }
    .next-steps ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .next-steps li {
      margin: 8px 0;
      font-size: 14px;
      color: #555;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
    .cta-button {
      display: inline-block;
      background-color: #4A90E2;
      color: #ffffff;
      padding: 14px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      transition: background-color 0.3s;
    }
    .cta-button:hover {
      background-color: #357ABD;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ 정서샤워 ☁️</h1>
    </div>

    <div class="content">
      <p class="greeting">안녕하세요 ${data.applicantName}님,</p>

      <p class="message">
        신청하신 <strong>30일 친절 챌린지</strong>가 승인되었습니다! 🎉<br>
        정서샤워와 함께 따뜻한 마음을 가꾸는 여정을 시작해보세요.
      </p>

      <div class="code-box">
        <p class="code-label">인증 코드</p>
        <div class="code">${data.code}</div>
        <p class="code-label">회원가입 시 이 코드를 입력해주세요</p>
      </div>

      <div class="info-box">
        <p><strong>할당 기수:</strong> ${data.cohortName}</p>
        <p><strong>시작일:</strong> ${data.cohortStartDate}</p>
      </div>

      <div class="next-steps">
        <h3>📝 다음 단계</h3>
        <ol>
          <li>정서샤워 웹사이트에 접속하세요</li>
          <li>회원가입 페이지에서 위의 인증 코드를 입력하세요</li>
          <li>온보딩 과정을 완료하세요</li>
          <li>사전 설문을 작성하고 챌린지를 시작하세요!</li>
        </ol>
      </div>

      <div style="text-align: center;">
        <a href="https://emotional-shower.vercel.app/signup" class="cta-button">
          지금 시작하기
        </a>
      </div>
    </div>

    <div class="footer">
      <p>본 메일은 발신 전용입니다. 문의사항은 웹사이트를 통해 연락해주세요.</p>
      <p>&copy; 2025 정서샤워 (Emotional Shower). All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim()
  }),

  /**
   * Application Rejection Email Template (Future)
   * Sent when admin rejects a challenge application
   */
  applicationRejection: (applicantName: string, reason?: string) => ({
    subject: '[정서샤워] 챌린지 신청 결과 안내',
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f7f9fc;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px 30px;
    }
    .message {
      font-size: 15px;
      color: #555;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>정서샤워</h2>
    <p class="message">안녕하세요 ${applicantName}님,</p>
    <p class="message">
      신청해주셔서 감사합니다만, 현재 모집 정원이 마감되어 다음 기수를 안내드립니다.
    </p>
    ${reason ? `<p class="message"><strong>사유:</strong> ${reason}</p>` : ''}
    <p class="message">다음 기수 신청 시 다시 찾아뵙겠습니다.</p>
  </div>
</body>
</html>
    `.trim()
  }),

  /**
   * Challenge Start Confirmation Email
   * Sent when user completes pre-survey and challenge officially starts
   */
  challengeStart: (data: ChallengeStartData) => ({
    subject: '[정서샤워] 30일 친절 챌린지가 시작되었습니다!',
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4A90E2; font-size: 24px; }
    .message { font-size: 15px; color: #555; line-height: 1.6; margin: 20px 0; }
    .highlight { background-color: #fff9e6; border-left: 4px solid #ffd93d; padding: 15px; margin: 20px 0; }
    .cta-button { display: inline-block; background-color: #4A90E2; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ 정서샤워 ☁️</h1>
    </div>
    <p class="message">안녕하세요 ${data.name}님,</p>
    <p class="message">
      축하합니다! <strong>30일 친절 챌린지</strong>가 시작되었습니다. 🎉<br>
      오늘부터 첫 번째 기록을 남겨보세요.
    </p>
    <div class="highlight">
      <p><strong>기수:</strong> ${data.cohortName}</p>
      <p><strong>목표:</strong> 30일간 매일 친절한 행동 기록하기</p>
      <p><strong>성공 조건:</strong> 22개 이상의 스탬프 획득</p>
    </div>
    <div style="text-align: center;">
      <a href="https://emotional-shower.vercel.app/daily-record" class="cta-button">첫 기록 남기기</a>
    </div>
    <p class="message">따뜻한 마음을 가꾸는 여정을 응원합니다! 💙</p>
  </div>
</body>
</html>
    `.trim()
  }),

  /**
   * Challenge Completion Email (Success - ≥22 stamps)
   * Sent when user completes 30-day challenge with ≥22 stamps
   */
  challengeComplete: (data: ChallengeCompleteData) => ({
    subject: '[정서샤워] 축하합니다! 30일 챌린지를 완료하셨습니다',
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4A90E2; font-size: 24px; }
    .message { font-size: 15px; color: #555; line-height: 1.6; margin: 20px 0; }
    .success-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0; }
    .success-box h2 { font-size: 28px; margin: 0 0 10px 0; }
    .cta-button { display: inline-block; background-color: #4A90E2; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ 정서샤워 ☁️</h1>
    </div>
    <p class="message">안녕하세요 ${data.name}님,</p>
    <div class="success-box">
      <h2>🎉 챌린지 완료! 🎉</h2>
      <p style="font-size: 20px; margin: 10px 0;">${data.stamps}/30 스탬프 획득</p>
      <p>30일간의 여정을 성공적으로 완주하셨습니다!</p>
    </div>
    <p class="message">
      마지막 단계로 <strong>사후 설문</strong>을 완료해주세요.<br>
      설문을 완료하시면 개인 맞춤 리포트를 받아보실 수 있습니다.
    </p>
    <div style="text-align: center;">
      <a href="https://emotional-shower.vercel.app/post-survey" class="cta-button">사후 설문 작성하기</a>
    </div>
  </div>
</body>
</html>
    `.trim()
  }),

  /**
   * Challenge Failure Email (<22 stamps)
   * Sent when user completes 30 days but didn't get enough stamps
   */
  challengeFailure: (name: string, stamps: number) => ({
    subject: '[정서샤워] 챌린지 종료 안내',
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4A90E2; font-size: 24px; }
    .message { font-size: 15px; color: #555; line-height: 1.6; margin: 20px 0; }
    .info-box { background-color: #f8f9fa; border-left: 4px solid #4A90E2; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ 정서샤워 ☁️</h1>
    </div>
    <p class="message">안녕하세요 ${name}님,</p>
    <p class="message">
      30일 챌린지가 종료되었습니다.<br>
      총 <strong>${stamps}개의 스탬프</strong>를 획득하셨습니다.
    </p>
    <div class="info-box">
      <p>아쉽게도 성공 조건(22개 이상)을 달성하지 못하셨습니다.<br>
      하지만 시도하신 것만으로도 충분히 의미 있는 도전이었습니다.</p>
    </div>
    <p class="message">
      다음 기수에서 다시 도전해보시는 건 어떨까요?<br>
      정서샤워는 언제나 응원하겠습니다. 💙
    </p>
  </div>
</body>
</html>
    `.trim()
  }),

  /**
   * Milestone Reached Email (Day 7, 15, 22)
   * Sent when user reaches important milestones
   */
  milestoneReached: (data: MilestoneReachedData) => ({
    subject: `[정서샤워] ${data.day}일 달성을 축하합니다!`,
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4A90E2; font-size: 24px; }
    .message { font-size: 15px; color: #555; line-height: 1.6; margin: 20px 0; }
    .milestone-box { background: linear-gradient(135deg, #ffd93d 0%, #f39c12 100%); color: white; border-radius: 8px; padding: 25px; text-align: center; margin: 20px 0; }
    .milestone-box h2 { font-size: 24px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ 정서샤워 ☁️</h1>
    </div>
    <p class="message">안녕하세요 ${data.name}님,</p>
    <div class="milestone-box">
      <h2>🌟 DAY ${data.day} 달성! 🌟</h2>
      <p>계속 멋진 여정을 이어가세요!</p>
    </div>
    <p class="message">
      ${data.day}일간의 친절한 행동 기록, 정말 대단합니다!<br>
      앞으로도 따뜻한 마음을 가꾸는 여정을 함께해요. 💙
    </p>
  </div>
</body>
</html>
    `.trim()
  }),

  /**
   * Daily Record Reminder Email
   * Sent at 8 PM KST to users who haven't recorded today
   */
  dailyReminder: (data: DailyReminderData) => ({
    subject: `[정서샤워] DAY ${data.day} 기록 시간입니다`,
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4A90E2; font-size: 24px; }
    .message { font-size: 15px; color: #555; line-height: 1.6; margin: 20px 0; }
    .cta-button { display: inline-block; background-color: #4A90E2; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ 정서샤워 ☁️</h1>
    </div>
    <p class="message">안녕하세요 ${data.name}님,</p>
    <p class="message">
      오늘의 친절한 행동을 기록할 시간입니다! ✨<br>
      <strong>DAY ${data.day}</strong>의 기록을 남겨주세요.
    </p>
    <div style="text-align: center;">
      <a href="https://emotional-shower.vercel.app/daily-record" class="cta-button">오늘의 기록 남기기</a>
    </div>
  </div>
</body>
</html>
    `.trim()
  }),

  /**
   * Pre-Survey Reminder Email
   * Sent 24-48 hours after approval if pre-survey not completed
   */
  preSurveyReminder: (name: string) => ({
    subject: '[정서샤워] 사전 설문을 완료해주세요',
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4A90E2; font-size: 24px; }
    .message { font-size: 15px; color: #555; line-height: 1.6; margin: 20px 0; }
    .cta-button { display: inline-block; background-color: #4A90E2; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ 정서샤워 ☁️</h1>
    </div>
    <p class="message">안녕하세요 ${name}님,</p>
    <p class="message">
      챌린지를 시작하려면 <strong>사전 설문</strong>을 완료해주세요!<br>
      설문은 5분 이내로 완료하실 수 있습니다.
    </p>
    <div style="text-align: center;">
      <a href="https://emotional-shower.vercel.app/pre-survey" class="cta-button">사전 설문 작성하기</a>
    </div>
  </div>
</body>
</html>
    `.trim()
  }),

  /**
   * Post-Survey Reminder Email
   * Sent 24-48 hours after challenge completion if post-survey not completed
   */
  postSurveyReminder: (name: string) => ({
    subject: '[정서샤워] 사후 설문을 완료하고 리포트를 받아보세요',
    body: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f9fc; }
    .container { background-color: #ffffff; border-radius: 12px; padding: 40px 30px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { color: #4A90E2; font-size: 24px; }
    .message { font-size: 15px; color: #555; line-height: 1.6; margin: 20px 0; }
    .highlight { background-color: #fff9e6; border-left: 4px solid #ffd93d; padding: 15px; margin: 20px 0; }
    .cta-button { display: inline-block; background-color: #4A90E2; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>☁️ 정서샤워 ☁️</h1>
    </div>
    <p class="message">안녕하세요 ${name}님,</p>
    <p class="message">
      챌린지 리포트를 받으려면 <strong>사후 설문</strong>을 완료해주세요!
    </p>
    <div class="highlight">
      <p><strong>리포트에 포함될 내용:</strong></p>
      <ul>
        <li>30일간의 변화 분석</li>
        <li>감정 패턴 인사이트</li>
        <li>개인화된 피드백</li>
      </ul>
    </div>
    <div style="text-align: center;">
      <a href="https://emotional-shower.vercel.app/post-survey" class="cta-button">사후 설문 작성하기</a>
    </div>
  </div>
</body>
</html>
    `.trim()
  })
};
