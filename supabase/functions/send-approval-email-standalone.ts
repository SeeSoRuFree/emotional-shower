// Send Approval Email Edge Function (Standalone Version for Dashboard Deployment)
// This file contains all dependencies inlined for easy Dashboard paste

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface EmailRecipient {
  receiveMailAddr: string;
  receiveName?: string;
  receiveType: 'MRT0' | 'MRT1' | 'MRT2';
}

interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

interface EmailResponse {
  success: boolean;
  requestId?: string;
  error?: string;
  response?: any;
}

interface ApplicationApprovalData {
  applicantName: string;
  code: string;
  cohortName: string;
  cohortStartDate: string;
}

interface RequestBody {
  applicationId: string;
  code: string;
  cohortId: string;
}

// ============================================================================
// SUPABASE CLIENT UTILITY
// ============================================================================

const createServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// ============================================================================
// NHN CLOUD EMAIL CLIENT
// ============================================================================

class NHNCloudEmailClient {
  private appKey: string;
  private secretKey: string;
  private senderAddress: string;
  private senderName: string;
  private baseURL = 'https://email.api.nhncloudservice.com';

  constructor() {
    this.appKey = Deno.env.get('NHN_EMAIL_APP_KEY')!;
    this.secretKey = Deno.env.get('NHN_EMAIL_SECRET_KEY')!;
    this.senderAddress = Deno.env.get('NHN_EMAIL_SENDER_ADDRESS')!;
    this.senderName = Deno.env.get('NHN_EMAIL_SENDER_NAME') || '정서샤워';

    if (!this.appKey || !this.secretKey || !this.senderAddress) {
      throw new Error('Missing NHN Cloud Email credentials in environment variables');
    }
  }

  async sendEmail(params: SendEmailParams): Promise<EmailResponse> {
    try {
      const url = `${this.baseURL}/email/v2.1/appKeys/${this.appKey}/sender/mail`;

      const requestBody = {
        senderAddress: this.senderAddress,
        senderName: this.senderName,
        title: params.subject,
        body: params.body,
        receiverList: [
          {
            receiveMailAddr: params.to,
            receiveName: params.toName || params.to,
            receiveType: 'MRT0' as const
          }
        ]
      };

      console.log('[NHN Cloud] Sending email to:', params.to);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'X-Secret-Key': this.secretKey
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.header?.isSuccessful) {
        console.log('[NHN Cloud] Email sent successfully:', data.body?.data?.requestId);
        return {
          success: true,
          requestId: data.body?.data?.requestId,
          response: data
        };
      } else {
        console.error('[NHN Cloud] Email send failed:', data.header?.resultMessage);
        return {
          success: false,
          error: data.header?.resultMessage || 'Email send failed',
          response: data
        };
      }
    } catch (error) {
      console.error('[NHN Cloud] Email API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendEmailWithRetry(params: SendEmailParams, maxRetries = 3): Promise<EmailResponse> {
    let lastError: EmailResponse | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await this.sendEmail(params);

      if (result.success) {
        return result;
      }

      lastError = result;

      if (attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`[NHN Cloud] Retry ${attempt + 1}/${maxRetries} in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return lastError || {
      success: false,
      error: 'Max retries exceeded'
    };
  }
}

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================

const emailTemplates = {
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
  })
};

// ============================================================================
// MAIN EDGE FUNCTION
// ============================================================================

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[send-approval-email] Function invoked');

    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createServiceClient();

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error('[send-approval-email] Unauthorized:', userError);
      throw new Error('Unauthorized');
    }

    console.log('[send-approval-email] Authenticated user:', user.id);

    // 2. Check if user is admin
    const { data: userData, error: adminError } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (adminError || !userData?.is_admin) {
      console.error('[send-approval-email] Admin access required');
      throw new Error('Admin access required');
    }

    console.log('[send-approval-email] Admin verified');

    // 3. Parse request body
    const { applicationId, code, cohortId }: RequestBody = await req.json();

    if (!applicationId || !code || !cohortId) {
      throw new Error('Missing required parameters: applicationId, code, cohortId');
    }

    console.log('[send-approval-email] Processing:', { applicationId, code, cohortId });

    // 4. Fetch application details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('name, email')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('[send-approval-email] Application not found:', appError);
      throw new Error('Application not found');
    }

    console.log('[send-approval-email] Application found:', application.email);

    // 5. Fetch cohort details
    const { data: cohort, error: cohortError } = await supabase
      .from('cohorts')
      .select('name, start_date')
      .eq('id', cohortId)
      .single();

    if (cohortError || !cohort) {
      console.error('[send-approval-email] Cohort not found:', cohortError);
      throw new Error('Cohort not found');
    }

    console.log('[send-approval-email] Cohort found:', cohort.name);

    // 6. Prepare email content using template
    const emailContent = emailTemplates.applicationApproval({
      applicantName: application.name,
      code: code,
      cohortName: cohort.name,
      cohortStartDate: new Date(cohort.start_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });

    // 7. Send email via NHN Cloud
    const emailClient = new NHNCloudEmailClient();
    const result = await emailClient.sendEmailWithRetry({
      to: application.email,
      toName: application.name,
      subject: emailContent.subject,
      body: emailContent.body,
      isHtml: true
    });

    // 8. Log notification attempt to database
    const notificationLog = {
      user_id: null,
      type: 'application_approval',
      channel: 'email',
      status: result.success ? 'sent' : 'failed',
      recipient_email: application.email,
      recipient_name: application.name,
      subject: emailContent.subject,
      body: emailContent.body,
      provider_request_id: result.requestId,
      provider_response: result.response,
      error_message: result.error,
      metadata: {
        applicationId,
        cohortId,
        code
      },
      sent_at: result.success ? new Date().toISOString() : null,
      failed_at: result.success ? null : new Date().toISOString()
    };

    const { error: logError } = await supabase
      .from('notifications_log')
      .insert(notificationLog);

    if (logError) {
      console.error('[send-approval-email] Failed to log notification:', logError);
    }

    // 9. Return response
    if (result.success) {
      console.log('[send-approval-email] Email sent successfully:', result.requestId);
      return new Response(
        JSON.stringify({
          success: true,
          requestId: result.requestId,
          message: 'Approval email sent successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } else {
      throw new Error(result.error || 'Failed to send email');
    }

  } catch (error) {
    console.error('[send-approval-email] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
