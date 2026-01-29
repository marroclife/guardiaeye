-- Add position column to leads table for ordering within columns
ALTER TABLE public.leads 
ADD COLUMN position integer DEFAULT 0;

-- Initialize positions based on created_at (older leads get lower positions)
UPDATE public.leads 
SET position = subq.row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at) as row_num 
  FROM public.leads
) subq 
WHERE leads.id = subq.id;