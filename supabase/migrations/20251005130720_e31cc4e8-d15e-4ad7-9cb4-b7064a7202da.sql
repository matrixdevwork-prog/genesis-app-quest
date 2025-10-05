-- Fix 1: Restrict profiles table to show only own profile + create public leaderboard view
DROP POLICY "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Create a public leaderboard view with non-sensitive data only
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  id,
  username,
  avatar_url,
  credits,
  level,
  xp
FROM profiles
ORDER BY credits DESC;

-- Fix 2: Remove public INSERT access from fraud_logs (service role only)
DROP POLICY "System can insert fraud logs" ON fraud_logs;

-- No INSERT policy means only service role (edge functions) can insert
-- This prevents users from poisoning fraud detection data