-- Create moderation tables
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'user', 'campaign', 'comment')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  banned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  ban_type TEXT NOT NULL DEFAULT 'temporary' CHECK (ban_type IN ('temporary', 'permanent')),
  expires_at TIMESTAMP WITH TIME ZONE,
  appeal_status TEXT DEFAULT 'none' CHECK (appeal_status IN ('none', 'pending', 'approved', 'denied')),
  appeal_text TEXT,
  appeal_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  appeal_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'campaign', 'user', 'comment')),
  content_id UUID NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  auto_flagged BOOLEAN DEFAULT false,
  flag_reasons JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fraud_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  device_fingerprint TEXT,
  event_type TEXT NOT NULL,
  risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_reports
CREATE POLICY "Users can create reports" ON public.content_reports
  FOR INSERT WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports" ON public.content_reports
  FOR SELECT USING (auth.uid() = reported_by OR is_admin(auth.uid()));

CREATE POLICY "Admins can update reports" ON public.content_reports
  FOR UPDATE USING (is_admin(auth.uid()));

-- RLS Policies for user_bans
CREATE POLICY "Users can view their own bans" ON public.user_bans
  FOR SELECT USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Users can appeal their bans" ON public.user_bans
  FOR UPDATE USING (auth.uid() = user_id AND appeal_status = 'none')
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage bans" ON public.user_bans
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for moderation_queue
CREATE POLICY "Only admins can view moderation queue" ON public.moderation_queue
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can manage moderation queue" ON public.moderation_queue
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for fraud_logs
CREATE POLICY "Only admins can view fraud logs" ON public.fraud_logs
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "System can insert fraud logs" ON public.fraud_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for push_subscriptions
CREATE POLICY "Users can manage their own subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.push_subscriptions
  FOR SELECT USING (is_admin(auth.uid()));

-- Add updated_at triggers
CREATE TRIGGER update_content_reports_updated_at BEFORE UPDATE ON public.content_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_bans_updated_at BEFORE UPDATE ON public.user_bans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_moderation_queue_updated_at BEFORE UPDATE ON public.moderation_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Database functions for moderation
CREATE OR REPLACE FUNCTION public.check_user_banned(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_banned BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.user_bans 
    WHERE user_id = p_user_id 
    AND (ban_type = 'permanent' OR (ban_type = 'temporary' AND expires_at > now()))
  ) INTO is_banned;
  
  RETURN is_banned;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_flag_content(
  p_content_type TEXT,
  p_content_id UUID,
  p_reasons JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  queue_id UUID;
  priority_level TEXT;
BEGIN
  -- Determine priority based on reasons
  priority_level := CASE 
    WHEN p_reasons->>'spam_score' > '80' THEN 'critical'
    WHEN p_reasons->>'spam_score' > '60' THEN 'high'
    ELSE 'medium'
  END;
  
  INSERT INTO public.moderation_queue (
    content_type, content_id, priority, auto_flagged, flag_reasons
  ) VALUES (
    p_content_type, p_content_id, priority_level, true, p_reasons
  ) RETURNING id INTO queue_id;
  
  RETURN queue_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_fraud_event(
  p_user_id UUID,
  p_ip_address INET,
  p_device_fingerprint TEXT,
  p_event_type TEXT,
  p_details JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  risk_score INTEGER;
BEGIN
  -- Calculate risk score based on recent activity
  SELECT LEAST(100, COUNT(*) * 10) INTO risk_score
  FROM public.fraud_logs
  WHERE user_id = p_user_id 
  AND created_at > now() - INTERVAL '1 hour';
  
  INSERT INTO public.fraud_logs (
    user_id, ip_address, device_fingerprint, event_type, risk_score, details
  ) VALUES (
    p_user_id, p_ip_address, p_device_fingerprint, p_event_type, risk_score, p_details
  );
  
  -- Auto-flag if risk score is high
  IF risk_score > 70 THEN
    PERFORM public.auto_flag_content(
      'user',
      p_user_id,
      jsonb_build_object('risk_score', risk_score, 'reason', 'high_fraud_risk')
    );
  END IF;
END;
$$;