import { ContractWithRelations, CONTRACT_STATUS_LABELS, getPaymentStatusDisplay, isPaymentOverdue } from '@/types/finance';
import { Calendar, DollarSign, FileText, AlertTriangle, CheckCircle2, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractCardProps {
  contract: ContractWithRelations;
  onClick: () => void;
}

export function ContractCard({ contract, onClick }: ContractCardProps) {
  const paidAmount = contract.payments
    .filter((p) => p.status === 'pago')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueCount = contract.payments.filter((p) => p.status === 'atrasado').length;
  const pendingCount = contract.payments.filter((p) => p.status === 'pendente').length;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—';

  return (
    <div
      onClick={onClick}
      className="kanban-card p-4 mb-3 border-l-2 border-l-marroc-dourado/50 cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-display font-medium text-marroc-dourado text-sm truncate flex-1 mr-2">
          {contract.lead?.company || contract.lead?.name || 'Contrato'}
        </h4>
        <span
          className={cn(
            'px-2 py-0.5 rounded text-[10px] font-mono border',
            contract.status === 'ativo' && 'bg-marroc-esmeralda/10 text-marroc-esmeralda border-marroc-esmeralda/30',
            contract.status === 'pendente_assinatura' && 'bg-amber-500/10 text-amber-300 border-amber-500/30',
            contract.status === 'concluido' && 'bg-blue-400/10 text-blue-300 border-blue-400/30',
            contract.status === 'cancelado' && 'bg-red-500/10 text-red-300 border-red-500/30'
          )}
        >
          {CONTRACT_STATUS_LABELS[contract.status]}
        </span>
      </div>

      {contract.contract_number && (
        <div className="text-[10px] text-marroc-salvia/70 mb-2 flex items-center gap-1.5">
          <FileText className="w-3 h-3" />
          Contrato #{contract.contract_number}
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs text-marroc-texto">
          <DollarSign className="w-3.5 h-3.5 text-marroc-esmeralda" />
          {formatCurrency(contract.total_value)}
        </div>
        <div className="text-[10px] text-marroc-salvia/70">
          {contract.payments.length}x parcela{contract.payments.length > 1 ? 's' : ''}
        </div>
      </div>

      <div className="w-full bg-marroc-dourado/10 rounded-full h-1.5 mb-2 overflow-hidden">
        <div
          className="bg-marroc-esmeralda h-full rounded-full transition-all"
          style={{ width: `${contract.total_value > 0 ? (paidAmount / contract.total_value) * 100 : 0}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-marroc-salvia/70 pt-2 border-t border-marroc-dourado/15">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(contract.start_date)}
        </div>
        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-red-300">
              <AlertTriangle className="w-3 h-3" />
              {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
            </span>
          )}
          {pendingCount > 0 && overdueCount === 0 && (
            <span className="flex items-center gap-1 text-amber-300">
              <Clock className="w-3 h-3" />
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
          {pendingCount === 0 && overdueCount === 0 && contract.payments.length > 0 && (
            <span className="flex items-center gap-1 text-marroc-esmeralda">
              <CheckCircle2 className="w-3 h-3" />
              Quitado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
