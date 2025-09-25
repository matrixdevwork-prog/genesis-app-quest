-- Create enum types for better data consistency
CREATE TYPE task_type AS ENUM ('watch', 'like', 'subscribe');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'completed', 'cancelled');

-- Create videos table
CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- duration in seconds
  channel_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  task_type task_type NOT NULL,
  credits_reward INTEGER NOT NULL DEFAULT 1,
  status task_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_tasks table for tracking user task completion
CREATE TABLE public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  status task_status NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, task_id)
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  credits_allocated INTEGER NOT NULL,
  credits_spent INTEGER DEFAULT 0,
  target_actions INTEGER NOT NULL,
  completed_actions INTEGER DEFAULT 0,
  status campaign_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create credit_transactions table for audit trail
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for earnings, negative for spending
  transaction_type TEXT NOT NULL, -- 'task_completion', 'campaign_creation', 'referral_bonus', etc.
  reference_id UUID, -- can reference task_id, campaign_id, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table for admin permissions
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'moderator'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = user_uuid AND role = 'admin');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for videos table
CREATE POLICY "Videos are viewable by everyone" 
  ON public.videos FOR SELECT USING (true);

CREATE POLICY "Only admins can insert videos" 
  ON public.videos FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can update videos" 
  ON public.videos FOR UPDATE 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete videos" 
  ON public.videos FOR DELETE 
  USING (public.is_admin(auth.uid()));

-- RLS Policies for tasks table
CREATE POLICY "Tasks are viewable by everyone" 
  ON public.tasks FOR SELECT USING (true);

CREATE POLICY "Users can create tasks for their campaigns" 
  ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tasks" 
  ON public.tasks FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tasks" 
  ON public.tasks FOR DELETE 
  USING (auth.uid() = created_by);

-- RLS Policies for user_tasks table
CREATE POLICY "Users can view their own task assignments" 
  ON public.user_tasks FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "System can insert user task assignments" 
  ON public.user_tasks FOR INSERT 
  WITH CHECK (true); -- Will be controlled by functions

CREATE POLICY "Users can update their own task status" 
  ON public.user_tasks FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for campaigns table
CREATE POLICY "Users can view all campaigns" 
  ON public.campaigns FOR SELECT USING (true);

CREATE POLICY "Users can create their own campaigns" 
  ON public.campaigns FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
  ON public.campaigns FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
  ON public.campaigns FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for credit_transactions table
CREATE POLICY "Users can view their own transactions" 
  ON public.credit_transactions FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "System can insert transactions" 
  ON public.credit_transactions FOR INSERT 
  WITH CHECK (true); -- Will be controlled by functions

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can manage roles" 
  ON public.user_roles FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Function to handle credit transactions
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a task and award credits
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create campaign and deduct credits
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate and update user level based on XP
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_tasks_updated_at
  BEFORE UPDATE ON public.user_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_transactions;

-- Set replica identity for real-time updates
ALTER TABLE public.videos REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.user_tasks REPLICA IDENTITY FULL;
ALTER TABLE public.campaigns REPLICA IDENTITY FULL;
ALTER TABLE public.credit_transactions REPLICA IDENTITY FULL;