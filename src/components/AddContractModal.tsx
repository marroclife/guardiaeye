import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { ContractStatus } from '@/types/finance';

export interface ActiveProject {
  id: string;
  lead_id: string;
  lead: {
    id: string;
    name: string;
    company: string | null;
    phone: string | null;
  } | null;
  contract_number: string | null;
  status: string;
}

interface PaymentInput {
  amount: string;
  due_date: string;
  description: string;
  milestone: string;
}

interface AddContractModalProps {
  onAdd: (
    contract: {
      lead_id: string;
      project_id: string;
      contract_number: string | null;
      status: ContractStatus;
      total_value: number;
      installments_count: number;
      start_date: string | null;
      notes: string | null;
    },
    payments: { amount: number; due_date: string | null; description: string | null; milestone: string | null }[]
  ) => void;
  getActiveProjects: () => Promise<ActiveProject[]>;
}

export function AddContractModal({ onAdd, getActiveProjects }: AddContractModalProps) {
  const [open, setOpen] = useState(false);
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    project_id: '',
    contract_number: '',
    status: 'ativo' as ContractStatus,
    total_value: '',
    start_date: '',
    notes: '',
  });

  const [payments, setPayments] = useState<PaymentInput[]>([
    { amount: '', due_date: '', description: 'Parcela 1', milestone: '' },
  ]);

  useEffect(() => {
    if (open) {
      setLoadingProjects(true);
      getActiveProjects()
        .then((projects) => {
          setActiveProjects(projects);
          if (projects.length === 1) {
            setFormData((prev) => ({ ...prev, project_id: projects[0].id }));
          }
        })
        .finally(() => setLoadingProjects(false));
    }
  }, [open, getActiveProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id || !formData.total_value) return;

    const selectedProject = activeProjects.find((p) => p.id === formData.project_id);
    if (!selectedProject) return;

    const totalValue = parseFloat(formData.total_value);
    if (isNaN(totalValue) || totalValue <= 0) return;

    setSaving(true);
    try {
      await onAdd(
        {
          lead_id: selectedProject.lead_id,
          project_id: selectedProject.id,
          contract_number: formData.contract_number || null,
          status: formData.status,
          total_value: totalValue,
          installments_count: payments.length,
          start_date: formData.start_date || null,
          notes: formData.notes || null,
        },
        payments.map((p) => ({
          amount: parseFloat(p.amount) || 0,
          due_date: p.due_date || null,
          description: p.description || null,
          milestone: p.milestone || null,
        }))
      );

      setFormData({
        project_id: '',
        contract_number: '',
        status: 'ativo',
        total_value: '',
        start_date: '',
        notes: '',
      });
      setPayments([{ amount: '', due_date: '', description: 'Parcela 1', milestone: '' }]);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const addPayment = () => {
    setPayments((prev) => [
      ...prev,
      { amount: '', due_date: '', description: `Parcela ${prev.length + 1}`, milestone: '' },
    ]);
  };

  const removePayment = (index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePayment = (index: number, field: keyof PaymentInput, value: string) => {
    setPayments((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const selectedProject = activeProjects.find((p) => p.id === formData.project_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-marroc">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold text-marroc-dourado">
            Novo Contrato
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="project_id">Projeto *</Label>
            {loadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-marroc-salvia/70 h-10">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando projetos...
              </div>
            ) : activeProjects.length === 0 ? (
              <div className="text-sm text-amber-300/90 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                Nenhum projeto ativo disponível. Crie um projeto primeiro na aba Projetos.
              </div>
            ) : (
              <Select
                value={formData.project_id}
                onValueChange={(value) => setFormData({ ...formData, project_id: value })}
              >
                <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                  <SelectValue placeholder="Selecione um projeto em andamento" />
                </SelectTrigger>
                <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                  {activeProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.lead?.company || project.lead?.name || 'Projeto'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedProject && (
            <div className="text-xs text-marroc-salvia/70 bg-marroc-dourado/5 rounded-lg p-2">
              Lead: {selectedProject.lead?.name || '—'}
              {selectedProject.lead?.phone && ` · ${selectedProject.lead.phone}`}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_number">Nº do Contrato</Label>
              <Input
                id="contract_number"
                value={formData.contract_number}
                onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                placeholder="001/2026"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ContractStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                  <SelectItem value="pendente_assinatura">Pendente de Assinatura</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_value">Valor Total (R$) *</Label>
              <Input
                id="total_value"
                type="number"
                step="0.01"
                value={formData.total_value}
                onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Parcelas</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPayment}
                className="border-marroc-dourado/15 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {payments.map((payment, index) => (
                <div key={index} className="p-3 rounded-lg border border-marroc-dourado/15 bg-marroc-dourado/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-marroc-salvia/70">Parcela {index + 1}</span>
                    {payments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePayment(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Valor (R$)"
                      value={payment.amount}
                      onChange={(e) => updatePayment(index, 'amount', e.target.value)}
                      className="bg-marroc-muscgo/50 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                    />
                    <Input
                      type="date"
                      value={payment.due_date}
                      onChange={(e) => updatePayment(index, 'due_date', e.target.value)}
                      className="bg-marroc-muscgo/50 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Descrição"
                      value={payment.description}
                      onChange={(e) => updatePayment(index, 'description', e.target.value)}
                      className="bg-marroc-muscgo/50 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                    />
                    <Input
                      placeholder="Milestone (opcional)"
                      value={payment.milestone}
                      onChange={(e) => updatePayment(index, 'milestone', e.target.value)}
                      className="bg-marroc-muscgo/50 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda min-h-[80px] resize-none"
              placeholder="Condições especiais, etapas, observações..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-marroc-dourado/15 hover:bg-marroc-dourado/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !formData.project_id || !formData.total_value || activeProjects.length === 0}
              className="flex-1 btn-marroc"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Contrato'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
