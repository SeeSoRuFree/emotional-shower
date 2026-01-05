// Send Approval Email Edge Function
// Triggered when admin approves a challenge application
// Sends verification code to applicant's email via NHN Cloud

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { NHNCloudEmailClient } from '../_shared/nhn-cloud.ts';
import { emailTemplates } from '../_shared/email-templates.ts';

interface RequestBody {
  applicationId: string;
  code: string;
  cohortId: string;
}

serve(async (req) => {
  // CORS headers for cross-origin requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
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

    // Verify the user is authenticated
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
      user_id: null,  // No user account yet (pre-registration)
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
      // Don't throw - email was sent successfully even if logging failed
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
