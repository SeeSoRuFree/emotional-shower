// Verify Code Edge Function
// Verifies application code and returns cohort info + phone number for signup

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

interface VerifyCodeRequest {
  code: string;
}

serve(async (req) => {
  try {
    // 1. Parse request
    const { code }: VerifyCodeRequest = await req.json();

    if (!code || code.length !== 6) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid code format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Initialize Supabase client (service role - bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // 3. Look up application by code
    const upperCode = code.toUpperCase();
    const { data: application, error } = await supabase
      .from('applications')
      .select('id, cohort_id, status, code_used_at, phone_number')
      .eq('code', upperCode)
      .single();

    if (error || !application) {
      console.error('[VerifyCode] Application not found:', error);
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate code status
    // Code must be approved and not used
    if (application.status !== 'approved') {
      console.log('[VerifyCode] Code not approved:', application.status);
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (application.code_used_at) {
      console.log('[VerifyCode] Code already used');
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!application.cohort_id) {
      console.log('[VerifyCode] No cohort assigned');
      return new Response(
        JSON.stringify({ valid: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 5. Return valid code with cohort info and phone number
    return new Response(
      JSON.stringify({
        valid: true,
        cohortId: application.cohort_id,
        applicationId: application.id,
        phoneNumber: application.phone_number || null
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[VerifyCode] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        valid: false,
        error: 'Internal server error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
