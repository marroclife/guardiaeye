-- Idempotently seed Yume Sushi lead and its 05/08/2026 17:00 meeting
-- Stored as UTC: 17:00 America/Sao_Paulo (UTC-3 in August) = 20:00 UTC
DO $$
DECLARE
  yume_id UUID;
  meeting_time TIMESTAMPTZ := '2026-08-05T20:00:00+00:00';
BEGIN
  -- Look for an existing Yume Sushi lead by name or company
  SELECT id INTO yume_id
  FROM public.leads
  WHERE lower(name) LIKE '%yume%'
     OR lower(company) LIKE '%yume%'
  LIMIT 1;

  -- Create the lead if not found
  IF yume_id IS NULL THEN
    INSERT INTO public.leads (
      name,
      company,
      role,
      phone,
      email,
      website,
      status,
      ai_summary,
      value,
      priority,
      archived,
      obs,
      source,
      last_contact_at,
      position
    ) VALUES (
      'Yume Sushi',
      'Yume Sushi',
      NULL,
      NULL,
      NULL,
      NULL,
      'em_contato',
      NULL,
      NULL,
      'high',
      false,
      'Lead criado automaticamente para reunião agendada em 05/08/2026.',
      'manual',
      now(),
      0
    )
    RETURNING id INTO yume_id;
  END IF;

  -- Create the meeting event if it does not already exist on that day for this lead
  IF NOT EXISTS (
    SELECT 1
    FROM public.lead_events
    WHERE lead_id = yume_id
      AND scheduled_at >= date_trunc('day', meeting_time)
      AND scheduled_at < date_trunc('day', meeting_time + interval '1 day')
  ) THEN
    INSERT INTO public.lead_events (
      lead_id,
      title,
      type,
      scheduled_at,
      duration_minutes,
      notes,
      completed,
      completed_at
    ) VALUES (
      yume_id,
      'Reunião Yume Sushi',
      'reuniao',
      meeting_time,
      60,
      'Reunião de apresentação com o Yume Sushi agendada para terça-feira 05/08/2026 às 17:00.',
      false,
      NULL
    );
  END IF;
END $$;
