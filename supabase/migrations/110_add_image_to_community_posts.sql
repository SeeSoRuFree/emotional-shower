-- Add image_url column to community_posts table
ALTER TABLE community_posts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN community_posts.image_url IS 'URL of the image attached to the post (stored in Supabase Storage)';
