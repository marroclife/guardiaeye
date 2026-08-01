-- Fix ownership of the Yume Sushi lead/event seeded by the previous migration.
-- lead_events RLS requires user_id to match auth.uid(), so rows created without
-- an explicit user_id would be invisible in the app. This migration assigns them
-- to the first active user in auth.users.
DO $$
DECLARE
  yume_id UUID;
  target_user_id UUID;
BEGIN
  -- Pick the oldest active user as the owner
  SELECT id INTO target_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'No auth.users found; cannot assign ownership. Skipping.';
    RETURN;
  END IF;

  -- Find the Yume Sushi lead
  SELECT id INTO yume_id
  FROM public.leads
  WHERE lower(name) LIKE '%yume%'
     OR lower(company) LIKE '%yume%'
  LIMIT 1;

  IF yume_id IS NULL THEN
    RAISE NOTICE 'Yume Sushi lead not found; skipping.';
    RETURN;
  END IF;

  -- Assign ownership to the lead if it has no owner
  UPDATE public.leads
  SET user_id = target_user_id
  WHERE id = yume_id
    AND user_id IS NULL;

  -- Assign ownership to its events if they have no owner
  UPDATE public.lead_events
  SET user_id = target_user_id
  WHERE lead_id = yume_id
    AND user_id IS NULL;
END $$;
