-- Add source field for lead origin tracking
ALTER TABLE public.leads ADD COLUMN source text DEFAULT 'manual';

-- Add last_contact_at for tracking interactions
ALTER TABLE public.leads ADD COLUMN last_contact_at timestamp with time zone DEFAULT now();

-- Create index for performance on status queries
CREATE INDEX idx_leads_status ON public.leads(status);

-- Create index for last_contact_at queries (for stale lead detection)
CREATE INDEX idx_leads_last_contact ON public.leads(last_contact_at);

-- Update existing leads to have last_contact_at as their updated_at
UPDATE public.leads SET last_contact_at = updated_at WHERE last_contact_at IS NULL;