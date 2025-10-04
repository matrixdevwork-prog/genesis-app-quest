-- Update RLS policy to allow authenticated users to insert videos when creating campaigns
DROP POLICY IF EXISTS "Only admins can insert videos" ON videos;

-- Allow authenticated users to insert videos (they'll be creating them through campaigns)
CREATE POLICY "Authenticated users can insert videos"
ON videos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Keep admin-only policies for updates and deletes
-- (These already exist, just documenting for clarity)