import { useState, useEffect } from 'react';
import { LeadEvent, LeadEventType, LEAD_EVENT_TYPES } from '@/types/leadEvent';
import { Lead } from '@/types/lead';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AddLeadEventModalProps {
  leads: Lead[];
  initialLeadId?: string;
  initialDate?: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (event: Omit<LeadEvent, 'id' | 'created_at' | 'updated_at'>) => void;
}

interface LeadEventModalProps {
  leads: Lead[];
  initialLeadId?: string;
  initialDate?: Date;
  eventToEdit?: LeadEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (event: Omit<LeadEvent, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdate: (id: string, updates: Partial<LeadEvent>) => void;
}

export function LeadEventModal({
  leads,
  initialLeadId,
  initialDate,
  eventToEdit,
  open,
  onOpenChange,
  onAdd,
  onUpdate,
}: LeadEventModalProps) {
  const [formData, setFormData] = useState({
    leadId: initialLeadId || '',
    title: '',
    type: 'reuniao' as LeadEventType,
    date: initialDate || new Date(),
    time: '09:00',
    duration: '60',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      if (eventToEdit) {
        const date = new Date(eventToEdit.scheduled_at);
        const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        
        setFormData({
          leadId: eventToEdit.lead_id,
          title: eventToEdit.title,
          type: eventToEdit.type,
          date: date,
          time: time,
          duration: eventToEdit.duration_minutes?.toString() || '60',
          notes: eventToEdit.notes || '',
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          leadId: initialLeadId || prev.leadId || '',
          date: initialDate || prev.date || new Date(),
          title: '',
          type: 'reuniao',
          time: '09:00',
          duration: '60',
          notes: '',
        }));
      }
    }
  }, [open, initialLeadId, initialDate, eventToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.leadId || !formData.title) return;

    const [hours, minutes] = formData.time.split(':');
    const scheduledAt = new Date(formData.date);
    scheduledAt.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

    if (eventToEdit) {
      onUpdate(eventToEdit.id, {
        title: formData.title,
        type: formData.type,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: formData.duration ? parseInt(formData.duration, 10) : null,
        notes: formData.notes || null,
      });
    } else {
      onAdd({
        lead_id: formData.leadId,
        title: formData.title,
        type: formData.type,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: formData.duration ? parseInt(formData.duration, 10) : null,
        notes: formData.notes || null,
        completed: false,
        completed_at: null,
      });
    }

    onOpenChange(false);
  };

  const selectedLead = leads.find((l) => l.id === formData.leadId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold text-marroc-dourado flex items-center gap-2">
            {eventToEdit ? <Clock className="w-5 h-5 text-marroc-esmeralda" /> : <Plus className="w-5 h-5 text-marroc-esmeralda" />}
            {eventToEdit ? 'Editar Evento' : 'Agendar Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="lead">Lead *</Label>
            <Select
              value={formData.leadId}
              onValueChange={(value) => setFormData({ ...formData, leadId: value })}
            >
              <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                <SelectValue placeholder="Selecione um lead" />
              </SelectTrigger>
              <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15 max-h-60">
                {leads
                  .filter((l) => !l.archived)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} {lead.company ? `· ${lead.company}` : ''}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              placeholder="Ex: Reunião de apresentação"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value: LeadEventType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                  {LEAD_EVENT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.icon} {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left border-marroc-dourado/15 bg-marroc-dourado/5 hover:bg-marroc-dourado/10"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2 text-marroc-esmeralda" />
                    {formData.date ? format(formData.date, 'dd/MM/yyyy', { locale: ptBR }) : 'Escolher'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-marroc-muscgo border-marroc-dourado/15">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData({ ...formData, date })}
                    initialFocus
                    className="bg-marroc-muscgo"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marroc-esmeralda" />
                <Input
                  id="time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda min-h-[80px] resize-none"
              placeholder="Observações sobre o evento..."
            />
          </div>

          {selectedLead && (
            <div className="p-3 rounded-lg bg-marroc-dourado/5 border border-marroc-dourado/15 text-sm">
              <span className="text-marroc-salvia/70">Lead:</span>{' '}
              <span className="text-marroc-dourado font-medium">{selectedLead.name}</span>
              {selectedLead.company && (
                <span className="text-marroc-salvia/70"> · {selectedLead.company}</span>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-marroc-dourado/15 hover:bg-marroc-dourado/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.leadId || !formData.title}
              className="flex-1 btn-marroc"
            >
              {eventToEdit ? 'Salvar Alterações' : 'Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
