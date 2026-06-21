import { useState, useMemo } from 'react';
import { useFinance } from '@/hooks/useFinance';
import { useProjects } from '@/hooks/useProjects';
import { ContractCard } from '@/components/ContractCard';
import { AddContractModal } from '@/components/AddContractModal';
import { MetricCard } from '@/components/MetricCard';
import { ContractWithRelations, Payment, PAYMENT_STATUS_LABELS, getPaymentStatusDisplay } from '@/types/finance';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Loader2, Calendar, FileText, User, Check, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FinanceView() {
  const { contracts, loading, summary, createContract, updatePaymentStatus, deleteContract } = useFinance();
  const { getActiveProjects } = useProjects();

  const [selectedContract, setSelectedContract] = useState<ContractWithRelations | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sortedContracts = useMemo(() => {
    return [...contracts].sort((a, b) => {
      const aOverdue = a.payments.some((p) => p.status === 'atrasado');
      const bOverdue = b.payments.some((p) => p.status === 'atrasado');
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [contracts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-marroc-esmeralda" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-marroc-dourado text-lg hidden md:block">Financeiro</h3>
        <AddContractModal onAdd={createContract} getActiveProjects={getActiveProjects} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          title="Contratado"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(summary.totalContracted)}
          subtitle="valor total"
          icon={DollarSign}
          iconColor="text-marroc-esmeralda"
          delay={100}
        />
        <MetricCard
          title="Recebido"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(summary.totalPaid)}
          subtitle="parcelas pagas"
          icon={CheckCircle2}
          iconColor="text-marroc-dourado"
          delay={200}
        />
        <MetricCard
          title="A Receber"
          value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(summary.totalPending)}
          subtitle="pendente"
          icon={TrendingUp}
          iconColor="text-marroc-salvia"
          delay={300}
        />
        <MetricCard
          title="Atrasados"
          value={summary.overdueCount}
          subtitle="parcelas"
          icon={AlertTriangle}
          iconColor="text-red-400"
          delay={400}
        />
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12 text-marroc-salvia/70">
          <p className="text-sm">Nenhum contrato registrado ainda.</p>
          <p className="text-xs mt-1">Crie o primeiro contrato pelo botão acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onClick={() => {
                setSelectedContract(contract);
                setSheetOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <ContractDetailSheet
        contract={selectedContract}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onPaymentStatusChange={updatePaymentStatus}
        onDelete={deleteContract}
      />
    </div>
  );
}

interface ContractDetailSheetProps {
  contract: ContractWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentStatusChange: (paymentId: string, status: Payment['status']) => void;
  onDelete: (contractId: string) => void;
}

function ContractDetailSheet({
  contract,
  open,
  onOpenChange,
  onPaymentStatusChange,
  onDelete,
}: ContractDetailSheetProps) {
  if (!contract) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : '—';

  const paidAmount = contract.payments
    .filter((p) => p.status === 'pago')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg glass-card border-l border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-marroc-dourado/15">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold text-marroc-texto">
                {contract.lead?.company || contract.lead?.name || 'Contrato'}
              </SheetTitle>
              {contract.contract_number && (
                <p className="text-sm text-marroc-esmeralda mt-1">
                  Contrato #{contract.contract_number}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <InfoRow icon={User} label="Lead" value={contract.lead?.name || '—'} />
          <InfoRow icon={DollarSign} label="Valor Total" value={formatCurrency(contract.total_value)} highlight />
          <InfoRow icon={CheckCircle2} label="Recebido" value={formatCurrency(paidAmount)} />
          <InfoRow icon={TrendingUp} label="A Receber" value={formatCurrency(contract.total_value - paidAmount)} />
          <InfoRow icon={Calendar} label="Início" value={formatDate(contract.start_date)} />

          <div className="pt-3 border-t border-marroc-dourado/15">
            <div className="flex items-center gap-2 mb-4 text-marroc-salvia/70">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Parcelas</span>
            </div>

            <div className="space-y-3">
              {contract.payments.map((payment, index) => {
                const displayStatus = getPaymentStatusDisplay(payment);
                return (
                  <div
                    key={payment.id}
                    className={cn(
                      'p-3 rounded-lg border bg-marroc-dourado/5',
                      displayStatus === 'pago' && 'border-marroc-esmeralda/30 bg-marroc-esmeralda/5',
                      displayStatus === 'atrasado' && 'border-red-500/30 bg-red-500/5',
                      displayStatus === 'pendente' && 'border-marroc-dourado/15'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-marroc-texto">
                          {payment.description || `Parcela ${index + 1}`}
                        </div>
                        <div className="text-xs text-marroc-salvia/70">
                          {formatCurrency(payment.amount)} · Vencimento: {formatDate(payment.due_date)}
                        </div>
                        {payment.milestone && (
                          <div className="text-[10px] text-marroc-salvia/60 mt-1">
                            Milestone: {payment.milestone}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            'text-[10px]',
                            displayStatus === 'pago' && 'bg-marroc-esmeralda/20 text-marroc-esmeralda hover:bg-marroc-esmeralda/30',
                            displayStatus === 'atrasado' && 'bg-red-500/20 text-red-300 hover:bg-red-500/30',
                            displayStatus === 'pendente' && 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                          )}
                        >
                          {PAYMENT_STATUS_LABELS[displayStatus]}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      {payment.status !== 'pago' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-9 border-marroc-esmeralda/30 text-marroc-esmeralda hover:bg-marroc-esmeralda/10"
                          onClick={() => onPaymentStatusChange(payment.id, 'pago')}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Marcar Pago
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-9 border-marroc-dourado/30 text-marroc-salvia hover:bg-marroc-dourado/10"
                          onClick={() => onPaymentStatusChange(payment.id, 'pendente')}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Desfazer
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {contract.notes && (
            <div className="pt-3 border-t border-marroc-dourado/15">
              <p className="text-sm text-marroc-salvia/70 mb-2">Observações</p>
              <p className="text-sm text-marroc-texto/80 whitespace-pre-wrap bg-marroc-dourado/5 p-3 rounded-lg">
                {contract.notes}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12 border-red-500/30 text-red-300 hover:bg-red-500/10"
            onClick={() => {
              if (confirm('Remover este contrato?')) {
                onDelete(contract.id);
                onOpenChange(false);
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
            Remover Contrato
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoRow({ icon: Icon, label, value, highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-marroc-dourado/15">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-marroc-salvia/70" />
        <span className="text-sm text-marroc-salvia/70">{label}</span>
      </div>
      <span className={`text-sm ${highlight ? 'font-display text-marroc-dourado' : 'text-marroc-texto'}`}>
        {value}
      </span>
    </div>
  );
}
