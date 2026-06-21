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
import { Plus, Loader2 } from 'lucide-react';

export interface ClosedLead {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
}

export interface ProjectDraft {
  lead_id: string;
  contract_number: string | null;
  start_date: string | null;
  deadline: string | null;
  features: string[];
  notes: string | null;
  status: 'briefing';
  position: number;
}

interface AddProjectModalProps {
  onAdd: (project: ProjectDraft) => void;
  getClosedLeads: () => Promise<ClosedLead[]>;
  initialLeadId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
}

export function AddProjectModal({
  onAdd,
  getClosedLeads,
  initialLeadId,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: AddProjectModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const [closedLeads, setClosedLeads] = useState<ClosedLead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    lead_id: initialLeadId || '',
    contract_number: '',
    start_date: '',
    deadline: '',
    features: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      setLoadingLeads(true);
      getClosedLeads()
        .then((leads) => {
          setClosedLeads(leads);
          if (initialLeadId && leads.some((l) => l.id === initialLeadId)) {
            setFormData((prev) => ({ ...prev, lead_id: initialLeadId }));
          } else if (leads.length === 1) {
            setFormData((prev) => ({ ...prev, lead_id: leads[0].id }));
          }
        })
        .finally(() => setLoadingLeads(false));
    }
  }, [open, getClosedLeads, initialLeadId]);

  useEffect(() => {
    if (!open) {
      setFormData({
        lead_id: '',
        contract_number: '',
        start_date: '',
        deadline: '',
        features: '',
        notes: '',
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lead_id) return;

    setSaving(true);
    try {
      await onAdd({
        lead_id: formData.lead_id,
        contract_number: formData.contract_number || null,
        start_date: formData.start_date || null,
        deadline: formData.deadline || null,
        features: formData.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        notes: formData.notes || null,
        status: 'briefing',
        position: 0,
      });

      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const selectedLead = closedLeads.find((l) => l.id === formData.lead_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="glass-card border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold text-marroc-dourado">
            Novo Projeto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="lead_id">Lead Fechado *</Label>
            {loadingLeads ? (
              <div className="flex items-center gap-2 text-sm text-marroc-salvia/70 h-10">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando leads...
              </div>
            ) : closedLeads.length === 0 ? (
              <div className="text-sm text-amber-300/90 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                Nenhum lead fechado sem projeto. Feche um lead no Pipeline primeiro.
              </div>
            ) : (
              <Select
                value={formData.lead_id}
                onValueChange={(value) => setFormData({ ...formData, lead_id: value })}
              >
                <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                  <SelectValue placeholder="Selecione um lead fechado" />
                </SelectTrigger>
                <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                  {closedLeads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.company || lead.name} {lead.phone && `· ${lead.phone}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedLead && (
            <div className="text-xs text-marroc-salvia/70 bg-marroc-dourado/5 rounded-lg p-2">
              Contato: {selectedLead.name} {selectedLead.phone && `· ${selectedLead.phone}`}
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
            <Label htmlFor="deadline">Prazo de Entrega</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Funcionalidades (uma por linha)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda min-h-[100px] resize-none"
              placeholder="Landing page responsiva&#10;Integração com WhatsApp&#10;Dashboard administrativo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda min-h-[80px] resize-none"
              placeholder="Notas sobre escopo, prioridades ou reuniões..."
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
              disabled={saving || !formData.lead_id || closedLeads.length === 0}
              className="flex-1 btn-marroc"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Projeto'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
