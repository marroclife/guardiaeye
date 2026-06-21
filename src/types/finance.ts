export type ContractStatus =
  | 'pendente_assinatura'
  | 'ativo'
  | 'concluido'
  | 'cancelado';

export type PaymentStatus = 'pendente' | 'pago' | 'atrasado';

export interface Payment {
  id: string;
  created_at: string;
  updated_at: string;
  contract_id: string;
  amount: number;
  due_date: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  description: string | null;
  milestone: string | null;
  position: number;
}

export interface Contract {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  project_id: string | null;
  user_id: string | null;
  contract_number: string | null;
  status: ContractStatus;
  total_value: number;
  installments_count: number;
  start_date: string | null;
  notes: string | null;
}

export interface ContractWithRelations extends Contract {
  lead?: {
    id: string;
    name: string;
    company: string | null;
    phone: string | null;
  } | null;
  project?: {
    id: string;
    status: string;
  } | null;
  payments: Payment[];
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  pendente_assinatura: 'Pendente de Assinatura',
  ativo: 'Ativo',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  atrasado: 'Atrasado',
};

export function isPaymentOverdue(payment: Payment): boolean {
  if (payment.status === 'pago' || !payment.due_date) return false;
  const due = new Date(payment.due_date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return due < now;
}

export function getPaymentStatusDisplay(payment: Payment): PaymentStatus {
  if (payment.status === 'pago') return 'pago';
  if (isPaymentOverdue(payment)) return 'atrasado';
  return 'pendente';
}
