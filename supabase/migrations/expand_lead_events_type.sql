-- Expandir tipos de eventos em lead_events

-- Descobrir e remover a constraint existente (se for CHECK)
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.lead_events'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%type%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.lead_events DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Adicionar nova constraint com tipos expandidos (incluindo variações de acento)
ALTER TABLE public.lead_events
  ADD CONSTRAINT lead_events_type_check
  CHECK (type IN (
    'reuniao',
    'reunião',
    'ligacao',
    'ligação',
    'email',
    'proposta',
    'follow_up',
    'contato',
    'apresentacao',
    'apresentação',
    'visita',
    'fechamento',
    'outro'
  ));
