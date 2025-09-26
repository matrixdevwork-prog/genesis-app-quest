-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create referral events table
CREATE TABLE public.referral_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referee_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  bonus_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for referral_events
CREATE POLICY "Users can view their referral events" 
ON public.referral_events 
FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can insert referral events" 
ON public.referral_events 
FOR INSERT 
WITH CHECK (true);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_user_achievements_updated_at
BEFORE UPDATE ON public.user_achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create task verification function
CREATE OR REPLACE FUNCTION public.verify_task_completion(
  p_user_id UUID,
  p_task_id UUID,
  p_task_type TEXT,
  p_video_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  task_exists BOOLEAN;
  user_task_exists BOOLEAN;
BEGIN
  -- Check if task exists and is pending
  SELECT EXISTS(
    SELECT 1 FROM public.tasks 
    WHERE id = p_task_id 
    AND task_type = p_task_type::task_type 
    AND status = 'pending'
  ) INTO task_exists;
  
  IF NOT task_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user already has this task assigned
  SELECT EXISTS(
    SELECT 1 FROM public.user_tasks 
    WHERE user_id = p_user_id 
    AND task_id = p_task_id
  ) INTO user_task_exists;
  
  IF NOT user_task_exists THEN
    -- Assign task to user
    INSERT INTO public.user_tasks (user_id, task_id, status)
    VALUES (p_user_id, p_task_id, 'in_progress');
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Create fraud detection function
CREATE OR REPLACE FUNCTION public.detect_fraud_patterns(
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result JSONB := '{}';
  task_count INTEGER;
  recent_tasks INTEGER;
  same_ip_tasks INTEGER;
BEGIN
  -- Count total tasks completed by user
  SELECT COUNT(*) INTO task_count
  FROM public.user_tasks
  WHERE user_id = p_user_id
  AND status = 'completed';
  
  -- Count tasks completed in last hour
  SELECT COUNT(*) INTO recent_tasks
  FROM public.user_tasks
  WHERE user_id = p_user_id
  AND status = 'completed'
  AND completed_at > now() - INTERVAL '1 hour';
  
  -- Build fraud indicators
  result := jsonb_build_object(
    'total_tasks', task_count,
    'recent_tasks_hour', recent_tasks,
    'suspicious_activity', recent_tasks > 10,
    'risk_level', CASE 
      WHEN recent_tasks > 20 THEN 'high'
      WHEN recent_tasks > 10 THEN 'medium'
      ELSE 'low'
    END
  );
  
  RETURN result;
END;
$$;