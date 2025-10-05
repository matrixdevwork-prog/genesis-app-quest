-- Drop the existing view and recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard;

CREATE OR REPLACE VIEW public.leaderboard 
WITH (security_invoker=true)
AS
SELECT 
  id,
  username,
  avatar_url,
  credits,
  level,
  xp
FROM profiles
ORDER BY credits DESC;