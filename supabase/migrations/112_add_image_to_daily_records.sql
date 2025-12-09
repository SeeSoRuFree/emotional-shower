-- Add image_url column to daily_records table
ALTER TABLE daily_records
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN daily_records.image_url IS 'URL of the image attached to the daily record (stored in Supabase Storage)';
