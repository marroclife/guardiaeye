import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contract, ContractWithRelations, Payment, PaymentStatus } from '@/types/finance';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

function mapDbToPayment(row: Record<string, unknown>): Payment {
  return {
    id: String(row.id || ''),
    created_at: String(row.created_at || ''),
    updated_at: String(row.updated_at || ''),
    contract_id: String(row.contract_id || ''),
    amount: typeof row.amount === 'number' ? row.amount : 0,
    due_date: row.due_date ? String(row.due_date) : null,
    status: (row.status as PaymentStatus) || 'pendente',
    paid_at: row.paid_at ? String(row.paid_at) : null,
    description: row.description ? String(row.description) : null,
    milestone: row.milestone ? String(row.milestone) : null,
    position: typeof row.position === 'number' ? row.position : 0,
  };
}

function mapDbToContract(row: Record<string, unknown>): Contract {
  return {
    id: String(row.id || ''),
    created_at: String(row.created_at || ''),
    updated_at: String(row.updated_at || ''),
    lead_id: String(row.lead_id || ''),
    project_id: row.project_id ? String(row.project_id) : null,
    user_id: row.user_id ? String(row.user_id) : null,
    contract_number: row.contract_number ? String(row.contract_number) : null,
    status: (row.status as Contract['status']) || 'pendente_assinatura',
    total_value: typeof row.total_value === 'number' ? row.total_value : 0,
    installments_count: typeof row.installments_count === 'number' ? row.installments_count : 1,
    start_date: row.start_date ? String(row.start_date) : null,
    notes: row.notes ? String(row.notes) : null,
  };
}

export function useFinance() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*, lead:leads(id, name, company, phone), project:projects(id, status), payments(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typed = ((data || []) as Record<string, unknown>[]).map((row) => {
        const contract = mapDbToContract(row);
        const payments = Array.isArray(row.payments)
          ? (row.payments as Record<string, unknown>[]).map(mapDbToPayment)
          : [];
        return {
          ...contract,
          lead: row.lead as ContractWithRelations['lead'],
          project: row.project as ContractWithRelations['project'],
          payments: payments.sort((a, b) => a.position - b.position),
        };
      });

      setContracts(typed);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Erro ao carregar financeiro');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel('finance-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contracts' },
        () => fetchContracts()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => fetchContracts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchContracts]);

  async function createContract(
    contract: Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
    payments: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'contract_id'>[]
  ) {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      const { data: contractData, error: contractError } = await supabase
        .from('contracts')
        .insert([{ ...contract, user_id: user.id }])
        .select()
        .single();

      if (contractError) throw contractError;

      const newContract = mapDbToContract(contractData as Record<string, unknown>);

      if (payments.length > 0) {
        const { error: paymentsError } = await supabase.from('payments').insert(
          payments.map((p, index) => ({
            ...p,
            contract_id: newContract.id,
            position: index,
          }))
        );
        if (paymentsError) throw paymentsError;
      }

      toast.success('Contrato criado com sucesso!');
      fetchContracts();
      return newContract;
    } catch (error) {
      console.error('Error creating contract:', error);
      toast.error('Erro ao criar contrato');
    }
  }

  async function updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    try {
      const updates: Partial<Payment> = { status };
      if (status === 'pago') {
        updates.paid_at = new Date().toISOString();
      } else {
        updates.paid_at = null;
      }

      const { error } = await supabase.from('payments').update(updates).eq('id', paymentId);
      if (error) throw error;
      toast.success('Pagamento atualizado');
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Erro ao atualizar pagamento');
    }
  }

  async function updateContract(contractId: string, updates: Partial<Contract>) {
    try {
      const { error } = await supabase.from('contracts').update(updates).eq('id', contractId);
      if (error) throw error;
      toast.success('Contrato atualizado');
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error('Erro ao atualizar contrato');
    }
  }

  async function deleteContract(contractId: string) {
    try {
      const { error } = await supabase.from('contracts').delete().eq('id', contractId);
      if (error) throw error;
      toast.success('Contrato removido');
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Erro ao remover contrato');
    }
  }

  const summary = (() => {
    const totalContracted = contracts.reduce((acc, c) => acc + c.total_value, 0);
    const totalPaid = contracts.reduce(
      (acc, c) =>
        acc +
        c.payments
          .filter((p) => p.status === 'pago')
          .reduce((sum, p) => sum + p.amount, 0),
      0
    );
    const totalPending = contracts.reduce(
      (acc, c) =>
        acc +
        c.payments
          .filter((p) => p.status === 'pendente' || p.status === 'atrasado')
          .reduce((sum, p) => sum + p.amount, 0),
      0
    );
    const overdueCount = contracts.reduce(
      (acc, c) => acc + c.payments.filter((p) => p.status === 'atrasado').length,
      0
    );
    return { totalContracted, totalPaid, totalPending, overdueCount };
  })();

  return {
    contracts,
    loading,
    summary,
    createContract,
    updatePaymentStatus,
    updateContract,
    deleteContract,
    refetch: fetchContracts,
  };
}
