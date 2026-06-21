-- Contracts table: financial contracts tied to leads and projects
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_number TEXT,
  status TEXT NOT NULL DEFAULT 'pendente_assinatura' CHECK (status IN ('pendente_assinatura', 'ativo', 'concluido', 'cancelado')),
  total_value NUMERIC NOT NULL DEFAULT 0,
  installments_count INTEGER NOT NULL DEFAULT 1,
  start_date DATE,
  notes TEXT
);

-- Payments table: individual installments
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  milestone TEXT,
  position INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for contracts
CREATE POLICY "Users can view their own contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contracts"
ON public.contracts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
ON public.contracts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
ON public.contracts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for payments
CREATE POLICY "Users can view their own payments"
ON public.payments
FOR SELECT
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.contracts WHERE id = contract_id));

CREATE POLICY "Users can create their own payments"
ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = (SELECT user_id FROM public.contracts WHERE id = contract_id));

CREATE POLICY "Users can update their own payments"
ON public.payments
FOR UPDATE
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.contracts WHERE id = contract_id));

CREATE POLICY "Users can delete their own payments"
ON public.payments
FOR DELETE
TO authenticated
USING (auth.uid() = (SELECT user_id FROM public.contracts WHERE id = contract_id));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;

-- Indexes
CREATE INDEX idx_contracts_lead_id ON public.contracts(lead_id);
CREATE INDEX idx_contracts_project_id ON public.contracts(project_id);
CREATE INDEX idx_contracts_user_id ON public.contracts(user_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_payments_contract_id ON public.payments(contract_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_due_date ON public.payments(due_date);

-- Timestamps triggers
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function: mark overdue payments automatically
CREATE OR REPLACE FUNCTION public.check_overdue_payments()
RETURNS void AS $$
BEGIN
  UPDATE public.payments
  SET status = 'atrasado'
  WHERE status = 'pendente'
    AND due_date IS NOT NULL
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SET search_path = public;
