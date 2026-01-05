// Unified Notification Edge Function
// Handles all notification types (email + SMS) with user preferences

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import { NHNCloudEmailClient } from '../_shared/nhn-cloud-email.ts';
import { NHNCloudSMSClient } from '../_shared/nhn-cloud-sms.ts';
import { emailTemplates } from '../_shared/email-templates.ts';
import { smsTemplates } from '../_shared/sms-templates.ts';

// Notification type mapping
type NotificationType =
  | 'application_approval'
  | 'application_rejection'
  | 'challenge_start_reminder'
  | 'daily_record_reminder'
  | 'challenge_completion'
  | 'challenge_failure'
  | 'milestone_reached'
  | 'pre_survey_reminder'
  | 'post_survey_reminder';

type Channel = 'email' | 'sms';

interface NotificationRequest {
  userId?: string;  // Optional - if not provided, use data.email/phone/name directly
  type: NotificationType;
  channels: Channel[];
  data: Record<string, any>;
}

interface NotificationPreferences {
  email: {
    application: boolean;
    challenge: boolean;
    community: boolean;
    reminders: boolean;
  };
  sms: {
    application: boolean;
    challenge: boolean;
    community: boolean;
    reminders: boolean;
  };
}

serve(async (req) => {
  try {
    // 1. Parse request
    const { userId, type, channels, data }: NotificationRequest = await req.json();

    // Validate required fields
    if (!type || !channels || !Array.isArray(channels) || channels.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, channels' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Initialize Supabase client (service role - bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Get recipient info
    let user: { name: string; email?: string; phone_number?: string; notification_preferences?: any } | null = null;

    if (userId) {
      // Get user info from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email, phone_number, notification_preferences')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        console.error('[Notification] User not found:', userId, userError);
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      user = userData;
    } else {
      // Use recipient info from data directly (for applications without user account)
      if (!data.email && !data.phone_number) {
        return new Response(
          JSON.stringify({ error: 'Either userId or recipient email/phone must be provided' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      user = {
        name: data.name || 'User',
        email: data.email,
        phone_number: data.phone_number,
        notification_preferences: null  // No preferences for non-users, send all
      };
    }

    console.log('[Notification] Sending to:', { userId: userId || 'no-user', type, channels });

    // 4. Check user notification preferences
    const preferences = (user.notification_preferences || {
      email: { application: true, challenge: true, community: true, reminders: true },
      sms: { application: true, challenge: true, community: false, reminders: true }
    }) as NotificationPreferences;

    // Determine notification category for preference checking
    const category = getNotificationCategory(type);

    // Filter channels based on user preferences
    const allowedChannels = channels.filter(channel => {
      if (channel === 'email') {
        return preferences.email?.[category] !== false;
      } else if (channel === 'sms') {
        return preferences.sms?.[category] !== false;
      }
      return false;
    });

    if (allowedChannels.length === 0) {
      console.log('[Notification] User has disabled all requested channels for this type');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'User has disabled notifications for this type',
          channels_sent: []
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Send notifications via allowed channels
    const results: Array<{ channel: Channel; success: boolean; error?: string }> = [];

    for (const channel of allowedChannels) {
      try {
        if (channel === 'email' && user.email) {
          const result = await sendEmailNotification({
            type,
            recipient: { email: user.email, name: user.name },
            data,
            supabase,
            userId
          });
          results.push({ channel: 'email', success: result.success, error: result.error });
        } else if (channel === 'sms' && user.phone_number) {
          const result = await sendSMSNotification({
            type,
            recipient: { phone: user.phone_number, name: user.name },
            data,
            supabase,
            userId
          });
          results.push({ channel: 'sms', success: result.success, error: result.error });
        } else {
          console.warn(`[Notification] Missing ${channel} contact for user ${userId}`);
          results.push({
            channel,
            success: false,
            error: `User ${channel} not available`
          });
        }
      } catch (error) {
        console.error(`[Notification] Failed to send ${channel}:`, error);
        results.push({
          channel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 6. Return results
    const successCount = results.filter(r => r.success).length;
    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Sent ${successCount}/${results.length} notifications`,
        results
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Notification] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// Helper: Get notification category for preference checking
function getNotificationCategory(type: NotificationType): keyof NotificationPreferences['email'] {
  if (type.includes('application')) return 'application';
  if (type.includes('challenge') || type.includes('milestone')) return 'challenge';
  if (type.includes('community')) return 'community';
  if (type.includes('reminder') || type.includes('survey')) return 'reminders';
  return 'challenge'; // default
}

// Send email notification
async function sendEmailNotification({
  type,
  recipient,
  data,
  supabase,
  userId
}: {
  type: NotificationType;
  recipient: { email: string; name: string };
  data: Record<string, any>;
  supabase: any;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Get email template
    let template: { subject: string; body: string } | null = null;

    switch (type) {
      case 'application_approval':
        template = emailTemplates.applicationApproval({
          applicantName: recipient.name,
          code: data.code,
          cohortName: data.cohortName || 'N/A',
          cohortStartDate: data.cohortStartDate || 'TBD'
        });
        break;

      case 'application_rejection':
        template = emailTemplates.applicationRejection(recipient.name);
        break;

      case 'challenge_start_reminder':
        template = emailTemplates.challengeStart({
          name: recipient.name,
          cohortName: data.cohortName || 'N/A'
        });
        break;

      case 'challenge_completion':
        template = emailTemplates.challengeComplete({
          name: recipient.name,
          stamps: data.stamps || 0
        });
        break;

      case 'challenge_failure':
        template = emailTemplates.challengeFailure(recipient.name, data.stamps || 0);
        break;

      case 'milestone_reached':
        template = emailTemplates.milestoneReached({
          name: recipient.name,
          day: data.day || 0
        });
        break;

      case 'daily_record_reminder':
        template = emailTemplates.dailyReminder({
          name: recipient.name,
          day: data.day || 1
        });
        break;

      case 'pre_survey_reminder':
        template = emailTemplates.preSurveyReminder(recipient.name);
        break;

      case 'post_survey_reminder':
        template = emailTemplates.postSurveyReminder(recipient.name);
        break;

      default:
        throw new Error(`Unknown email template for type: ${type}`);
    }

    if (!template) {
      throw new Error(`No email template found for type: ${type}`);
    }

    // Send email via NHN Cloud
    const emailClient = new NHNCloudEmailClient();
    const result = await emailClient.sendEmailWithRetry({
      to: recipient.email,
      subject: template.subject,
      body: template.body,
      senderName: '정서샤워'
    });

    // Log to notifications_log
    await supabase.from('notifications_log').insert({
      user_id: userId,
      type: type,
      channel: 'email',
      status: result.success ? 'sent' : 'failed',
      recipient_email: recipient.email,
      recipient_name: recipient.name,
      subject: template.subject,
      body: template.body,
      provider_request_id: result.requestId,
      provider_response: result.response,
      error_message: result.error,
      metadata: data,
      sent_at: result.success ? new Date().toISOString() : null,
      failed_at: result.success ? null : new Date().toISOString()
    });

    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('[Email] Send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email send failed'
    };
  }
}

// Send SMS notification
async function sendSMSNotification({
  type,
  recipient,
  data,
  supabase,
  userId
}: {
  type: NotificationType;
  recipient: { phone: string; name: string };
  data: Record<string, any>;
  supabase: any;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Get SMS template
    let message: string | null = null;

    switch (type) {
      case 'application_approval':
        message = smsTemplates.applicationApproval({
          name: recipient.name,
          code: data.code
        });
        break;

      case 'application_rejection':
        message = smsTemplates.applicationRejection({ name: recipient.name });
        break;

      case 'challenge_start_reminder':
        message = smsTemplates.challengeStart(recipient.name);
        break;

      case 'challenge_completion':
        message = smsTemplates.challengeComplete({
          name: recipient.name,
          stamps: data.stamps || 0
        });
        break;

      case 'challenge_failure':
        message = smsTemplates.challengeFailure(recipient.name, data.stamps || 0);
        break;

      case 'milestone_reached':
        message = smsTemplates.milestoneReached({
          name: recipient.name,
          day: data.day || 0
        });
        break;

      case 'daily_record_reminder':
        message = smsTemplates.dailyReminder(recipient.name, data.day || 1);
        break;

      case 'pre_survey_reminder':
        message = smsTemplates.preSurveyReminder(recipient.name);
        break;

      case 'post_survey_reminder':
        message = smsTemplates.postSurveyReminder(recipient.name);
        break;

      default:
        throw new Error(`Unknown SMS template for type: ${type}`);
    }

    if (!message) {
      throw new Error(`No SMS template found for type: ${type}`);
    }

    // Send SMS via NHN Cloud
    const smsClient = new NHNCloudSMSClient();
    const result = await smsClient.sendSMSWithRetry({
      to: recipient.phone,
      message: message
    });

    // Log to notifications_log
    await supabase.from('notifications_log').insert({
      user_id: userId,
      type: type,
      channel: 'sms',
      status: result.success ? 'sent' : 'failed',
      recipient_phone: recipient.phone,
      recipient_name: recipient.name,
      body: message,
      provider_request_id: result.requestId,
      provider_response: result.response,
      error_message: result.error,
      metadata: data,
      sent_at: result.success ? new Date().toISOString() : null,
      failed_at: result.success ? null : new Date().toISOString()
    });

    return { success: result.success, error: result.error };
  } catch (error) {
    console.error('[SMS] Send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMS send failed'
    };
  }
}
