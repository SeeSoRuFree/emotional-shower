-- ==========================================
-- Notifications Log Table
-- Tracks all notification delivery attempts via email, SMS, or push
-- ==========================================

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
  'application_approval',
  'application_rejection',
  'challenge_start_reminder',
  'daily_record_reminder',
  'challenge_completion',
  'challenge_failure',
  'cohort_announcement',
  'community_reply',
  'community_like_milestone',
  'pre_survey_reminder',
  'post_survey_reminder',
  'weekly_progress_report',
  'cohort_start_notification',
  'admin_direct_message',
  'account_security_alert'
);

-- Notification channel enum
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'push');

-- Notification status enum
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'bounced');

-- Main notifications log table
CREATE TABLE notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Notification details
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  status notification_status DEFAULT 'pending',

  -- Recipient info
  recipient_email TEXT,
  recipient_phone TEXT,
  recipient_name TEXT,

  -- Content
  subject TEXT,
  body TEXT NOT NULL,
  template_id TEXT,
  template_params JSONB,

  -- Delivery tracking
  provider_request_id TEXT,        -- NHN Cloud requestId
  provider_response JSONB,         -- Full API response
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB,                  -- Additional context (cohortId, applicationId, etc.)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- At least one recipient must be specified
  CONSTRAINT check_recipient CHECK (
    recipient_email IS NOT NULL OR recipient_phone IS NOT NULL
  )
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications_log(user_id);
CREATE INDEX idx_notifications_type ON notifications_log(type);
CREATE INDEX idx_notifications_channel ON notifications_log(channel);
CREATE INDEX idx_notifications_status ON notifications_log(status);
CREATE INDEX idx_notifications_created_at ON notifications_log(created_at DESC);
CREATE INDEX idx_notifications_provider_request_id ON notifications_log(provider_request_id);

-- RLS Policies
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification logs
CREATE POLICY "Users can view own notifications"
  ON notifications_log FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all notification logs
CREATE POLICY "Admins can view all notifications"
  ON notifications_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Only Edge Functions (service role) can insert/update
-- No policy needed - service_role bypasses RLS

-- Add table comment
COMMENT ON TABLE notifications_log IS 'Tracks all notification delivery attempts via email, SMS, or push';
COMMENT ON COLUMN notifications_log.provider_request_id IS 'NHN Cloud API request ID for tracking delivery status';
COMMENT ON COLUMN notifications_log.provider_response IS 'Full response from NHN Cloud API';
COMMENT ON COLUMN notifications_log.metadata IS 'Additional context like applicationId, cohortId, postId, etc.';
