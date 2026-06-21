-- Create projects table for post-sale development pipeline
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_number TEXT,
  start_date DATE,
  deadline DATE,
  features TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'briefing' CHECK (status IN ('briefing', 'design', 'desenvolvimento', 'revisao', 'entrega', 'concluido', 'pausado')),
  notes TEXT,
  position INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies that require authentication
CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
ON public.projects
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime for projects table
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Create index for lead_id lookups
CREATE INDEX idx_projects_lead_id ON public.projects(lead_id);

-- Create index for status queries
CREATE INDEX idx_projects_status ON public.projects(status);

-- Create index for user_id lookups
CREATE INDEX idx_projects_user_id ON public.projects(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
