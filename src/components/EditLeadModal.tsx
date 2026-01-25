import { useState, useEffect } from 'react';
import { Lead, LeadPriority, LeadStatus, LeadSource, LEAD_SOURCES, KANBAN_COLUMNS } from '@/types/lead';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Save, Loader2 } from 'lucide-react';

interface EditLeadModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (leadId: string, updates: Partial<Lead>) => Promise<void>;
}

export function EditLeadModal({ lead, open, onOpenChange, onSave }: EditLeadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    phone: '',
    email: '',
    website: '',
    value: '',
    priority: 'medium' as LeadPriority,
    status: 'triagem' as LeadStatus,
    source: 'manual' as LeadSource,
    obs: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        company: lead.company || '',
        role: lead.role || '',
        phone: lead.phone || '',
        email: lead.email || '',
        website: lead.website || '',
        value: lead.value?.toString() || '',
        priority: lead.priority || 'medium',
        status: lead.status || 'triagem',
        source: lead.source || 'manual',
        obs: lead.obs || '',
      });
    }
  }, [lead]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setSaving(true);
    try {
      await onSave(lead.id, {
        name: formData.name,
        company: formData.company || null,
        role: formData.role || null,
        phone: formData.phone || null,
        email: formData.email || null,
        website: formData.website || null,
        value: formData.value ? parseFloat(formData.value) : null,
        priority: formData.priority,
        status: formData.status,
        source: formData.source,
        obs: formData.obs || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-card border-white/10 bg-black/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <span className="text-neon-cyan">✎</span> Editar Lead
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-muted-foreground">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-neon-cyan"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm text-muted-foreground">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-neon-cyan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm text-muted-foreground">WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-neon-cyan"
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-neon-cyan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Origem</Label>
              <Select
                value={formData.source}
                onValueChange={(value: LeadSource) => setFormData(prev => ({ ...prev, source: value }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/10">
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.icon} {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm text-muted-foreground">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-neon-cyan"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm text-muted-foreground">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                className="bg-white/5 border-white/10 focus:border-neon-cyan"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Temperatura</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: LeadPriority) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/10">
                  <SelectItem value="low">🥶 Frio</SelectItem>
                  <SelectItem value="medium">😐 Morno</SelectItem>
                  <SelectItem value="high">🔥 Quente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: LeadStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-white/10">
                  {KANBAN_COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.icon} {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Observações</Label>
            <Textarea
              value={formData.obs}
              onChange={(e) => setFormData(prev => ({ ...prev, obs: e.target.value }))}
              className="bg-white/5 border-white/10 focus:border-neon-cyan min-h-[80px] resize-none"
              placeholder="Notas e observações sobre o lead..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !formData.name}
              className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
