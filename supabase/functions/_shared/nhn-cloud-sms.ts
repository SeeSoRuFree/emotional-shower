// NHN Cloud SMS API v3.0 Client
// Documentation: https://docs.nhncloud.com/ko/Notification/SMS/ko/api-guide/

export interface SendSMSParams {
  to: string;
  message: string;
  senderNumber?: string;
}

export interface SMSResponse {
  success: boolean;
  requestId?: string;
  error?: string;
  response?: any;
}

export class NHNCloudSMSClient {
  private appKey: string;
  private secretKey: string;
  private senderNumber: string;
  private baseURL = 'https://api-sms.cloud.toast.com';

  constructor() {
    this.appKey = Deno.env.get('NHN_SMS_APP_KEY')!;
    this.secretKey = Deno.env.get('NHN_SMS_SECRET_KEY')!;
    this.senderNumber = Deno.env.get('NHN_SMS_SENDER_NUMBER')!;

    if (!this.appKey || !this.secretKey || !this.senderNumber) {
      throw new Error('Missing NHN Cloud SMS credentials in environment variables');
    }
  }

  /**
   * Send an SMS via NHN Cloud SMS API v3.0
   */
  async sendSMS(params: SendSMSParams): Promise<SMSResponse> {
    try {
      const url = `${this.baseURL}/sms/v3.0/appKeys/${this.appKey}/sender/sms`;

      // Remove dashes from phone number (format: 01012345678)
      const recipientNo = params.to.replace(/-/g, '');
      const sendNo = (params.senderNumber || this.senderNumber).replace(/-/g, '');

      const requestBody = {
        body: params.message,
        sendNo: sendNo,
        recipientList: [
          {
            recipientNo: recipientNo,
            templateParameter: {}
          }
        ]
      };

      console.log('[NHN Cloud SMS] Sending SMS to:', recipientNo);

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
        console.log('[NHN Cloud SMS] SMS sent successfully:', data.body?.data?.requestId);
        return {
          success: true,
          requestId: data.body?.data?.requestId,
          response: data
        };
      } else {
        console.error('[NHN Cloud SMS] SMS send failed:', data.header?.resultMessage);
        return {
          success: false,
          error: data.header?.resultMessage || 'SMS send failed',
          response: data
        };
      }
    } catch (error) {
      console.error('[NHN Cloud SMS] SMS API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send SMS with retry logic (exponential backoff)
   */
  async sendSMSWithRetry(
    params: SendSMSParams,
    maxRetries = 3
  ): Promise<SMSResponse> {
    let lastError: SMSResponse | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const result = await this.sendSMS(params);

      if (result.success) {
        return result;
      }

      lastError = result;

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`[NHN Cloud SMS] Retry ${attempt + 1}/${maxRetries} in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return lastError || {
      success: false,
      error: 'Max retries exceeded'
    };
  }
}
