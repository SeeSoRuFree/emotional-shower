-- Create storage buckets for image uploads
-- Note: This should be run in Supabase Dashboard > Storage section
-- or via Supabase CLI with proper permissions

-- These statements create public buckets for community and daily record images
-- The actual bucket creation should be done via Supabase Dashboard:
-- 1. Go to Storage section
-- 2. Click "New bucket"
-- 3. Create bucket named "community-images" (public)
-- 4. Create bucket named "daily-record-images" (public)

-- Storage policies (run in SQL Editor after creating buckets):

-- Allow authenticated users to upload images to community-images
-- INSERT policy for authenticated users
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community-images'
);

-- Allow public read access to community images
-- SELECT policy for public
CREATE POLICY "Public can view community images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'community-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own community images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'community-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Same policies for daily-record-images bucket
CREATE POLICY "Authenticated users can upload daily record images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'daily-record-images'
);

CREATE POLICY "Public can view daily record images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'daily-record-images');

CREATE POLICY "Users can delete own daily record images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'daily-record-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
