-- Fix security warnings by setting search_path for all functions

-- Update get_user_role function with SET search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update is_admin function with SET search_path
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = user_uuid AND role = 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update add_credits function with SET search_path
CREATE OR REPLACE FUNCTION public.add_credits(
  target_user_id UUID,
  credit_amount INTEGER,
  transaction_type TEXT,
  reference_id UUID DEFAULT NULL,
  description TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update user credits
  UPDATE public.profiles 
  SET credits = credits + credit_amount,
      updated_at = now()
  WHERE id = target_user_id;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id, amount, transaction_type, reference_id, description
  ) VALUES (
    target_user_id, credit_amount, transaction_type, reference_id, description
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update complete_task function with SET search_path
CREATE OR REPLACE FUNCTION public.complete_task(
  p_user_id UUID,
  p_task_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  task_credits INTEGER;
BEGIN
  -- Check if task exists and get credits
  SELECT credits_reward INTO task_credits
  FROM public.tasks 
  WHERE id = p_task_id;
  
  IF task_credits IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update user_tasks status
  UPDATE public.user_tasks 
  SET status = 'completed',
      completed_at = now(),
      credits_earned = task_credits,
      updated_at = now()
  WHERE user_id = p_user_id AND task_id = p_task_id;
  
  -- Award credits
  PERFORM public.add_credits(
    p_user_id, 
    task_credits, 
    'task_completion', 
    p_task_id,
    'Task completion reward'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update create_campaign function with SET search_path
CREATE OR REPLACE FUNCTION public.create_campaign(
  p_user_id UUID,
  p_video_id UUID,
  p_title TEXT,
  p_credits_allocated INTEGER,
  p_target_actions INTEGER
)
RETURNS UUID AS $$
DECLARE
  campaign_id UUID;
  user_credits INTEGER;
BEGIN
  -- Check if user has enough credits
  SELECT credits INTO user_credits
  FROM public.profiles 
  WHERE id = p_user_id;
  
  IF user_credits < p_credits_allocated THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Create campaign
  INSERT INTO public.campaigns (
    user_id, video_id, title, credits_allocated, target_actions
  ) VALUES (
    p_user_id, p_video_id, p_title, p_credits_allocated, p_target_actions
  ) RETURNING id INTO campaign_id;
  
  -- Deduct credits
  PERFORM public.add_credits(
    p_user_id, 
    -p_credits_allocated, 
    'campaign_creation', 
    campaign_id,
    'Campaign creation cost'
  );
  
  RETURN campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update update_user_level function with SET search_path
CREATE OR REPLACE FUNCTION public.update_user_level(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  current_xp INTEGER;
  new_level INTEGER;
BEGIN
  SELECT xp INTO current_xp
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Simple level calculation: level = xp / 100 + 1
  new_level := (current_xp / 100) + 1;
  
  UPDATE public.profiles 
  SET level = new_level,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;