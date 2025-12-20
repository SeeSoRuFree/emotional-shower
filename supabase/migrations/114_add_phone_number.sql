-- Migration 114: Add phone_number and notification preferences to users table
-- This enables SMS notifications and user notification preferences

-- Add phone_number and notification_preferences columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "email": {
      "application": true,
      "challenge": true,
      "community": true,
      "reminders": true
    },
    "sms": {
      "application": true,
      "challenge": true,
      "community": false,
      "reminders": true
    }
  }'::jsonb;

-- Create index for phone number lookups
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);

-- Add comment for documentation
COMMENT ON COLUMN users.phone_number IS '사용자 휴대폰 번호 (SMS 알림용)';
COMMENT ON COLUMN users.notification_preferences IS '사용자 알림 설정 (채널별, 타입별)';

-- RLS Policy: Users can update their own phone number and preferences
CREATE POLICY "Users can update own phone and preferences"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
