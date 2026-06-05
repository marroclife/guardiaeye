import { useState } from 'react';
import { Lead, LeadPriority, LeadStatus, LeadSource, LEAD_SOURCES } from '@/types/lead';
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
import { Plus } from 'lucide-react';

interface AddLeadModalProps {
  onAdd: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function AddLeadModal({ onAdd }: AddLeadModalProps) {
  const [open, setOpen] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
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
      ai_summary: null,
      archived: false,
      obs: formData.obs || null,
      last_contact_at: new Date().toISOString(),
      position: 0,
    });

    setFormData({
      name: '',
      company: '',
      role: '',
      phone: '',
      email: '',
      website: '',
      value: '',
      priority: 'medium',
      status: 'triagem',
      source: 'manual',
      obs: '',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-marroc">
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold text-marroc-dourado">
            Adicionar Lead
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              placeholder="Nome do contato"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Origem</Label>
              <Select
                value={formData.source}
                onValueChange={(value: LeadSource) => setFormData({ ...formData, source: value })}
              >
                <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                  {LEAD_SOURCES.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      {source.icon} {source.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                placeholder="+55 11 99999-9999"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                placeholder="email@empresa.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor Estimado (R$)</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda font-mono"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Temperatura</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: LeadPriority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                  <SelectItem value="low">🧊 Frio</SelectItem>
                  <SelectItem value="medium">🔥 Morno</SelectItem>
                  <SelectItem value="high">💥 Quente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              placeholder="www.empresa.com.br"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              value={formData.obs}
              onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda min-h-[80px] resize-none"
              placeholder="Notas e observações sobre o lead..."
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
            <Button type="submit" className="flex-1 btn-marroc">
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
