-- Create lead_events table for calendar/scheduling in the CRM
CREATE TABLE public.lead_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'outro' CHECK (type IN ('reuniao', 'contato', 'proposta', 'follow_up', 'outro')),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies that require authentication
CREATE POLICY "Users can view their own lead events"
ON public.lead_events
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead events"
ON public.lead_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead events"
ON public.lead_events
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead events"
ON public.lead_events
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for lead_events table
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_events;

-- Create indexes
CREATE INDEX idx_lead_events_lead_id ON public.lead_events(lead_id);
CREATE INDEX idx_lead_events_scheduled_at ON public.lead_events(scheduled_at);
CREATE INDEX idx_lead_events_user_id ON public.lead_events(user_id);
CREATE INDEX idx_lead_events_completed ON public.lead_events(completed);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lead_events_updated_at
  BEFORE UPDATE ON public.lead_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
