-- Create leads table for the CRM
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  company TEXT,
  role TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'triagem',
  ai_summary TEXT,
  value NUMERIC,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (for demo purposes - in production you'd want auth)
CREATE POLICY "Allow public read access" ON public.leads
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.leads
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON public.leads
  FOR DELETE USING (true);

-- Enable realtime for leads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();