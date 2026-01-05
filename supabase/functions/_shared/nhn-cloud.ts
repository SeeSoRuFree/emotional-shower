// NHN Cloud Email API v2.1 Client
// Documentation: https://docs.nhncloud.com/en/Notification/Email/en/api-guide/

export interface EmailRecipient {
  receiveMailAddr: string;
  receiveName?: string;
  receiveType: 'MRT0' | 'MRT1' | 'MRT2';  // MRT0=To, MRT1=Cc, MRT2=Bcc
}

export interface SendEmailParams {
  to: string;
  toName?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface EmailResponse {
  success: boolean;
  requestId?: string;
  error?: string;
  response?: any;
}

export class NHNCloudEmailClient {
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

  /**
   * Send an email via NHN Cloud Email API v2.1
   */
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
            receiveType: 'MRT0' as const  // MRT0 = To (main recipient)
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

      // Check NHN Cloud API response format
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

  /**
   * Send email with retry logic (exponential backoff)
   */
  async sendEmailWithRetry(
    params: SendEmailParams,
    maxRetries = 3
  ): Promise<EmailResponse> {
    let lastError: EmailResponse | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await this.sendEmail(params);

      if (result.success) {
        return result;
      }

      lastError = result;

      // Exponential backoff: 1s, 2s, 4s
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
