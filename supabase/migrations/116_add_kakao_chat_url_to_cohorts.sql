-- Add kakao_chat_url field to cohorts table
ALTER TABLE cohorts
ADD COLUMN IF NOT EXISTS kakao_chat_url TEXT;

COMMENT ON COLUMN cohorts.kakao_chat_url IS 'Kakao open chat room URL for this cohort';
