-- Add archived column to leads table
ALTER TABLE public.leads ADD COLUMN archived boolean NOT NULL DEFAULT false;

-- Create index for better performance when filtering archived leads
CREATE INDEX idx_leads_archived ON public.leads(archived);