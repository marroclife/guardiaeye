import { useState, useEffect } from 'react';
import { Project, ProjectStatus, PROJECT_COLUMNS } from '@/types/project';
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

interface EditProjectModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (projectId: string, updates: Partial<Project>) => Promise<void>;
}

export function EditProjectModal({ project, open, onOpenChange, onSave }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    contract_number: '',
    start_date: '',
    deadline: '',
    features: '',
    notes: '',
    status: 'briefing' as ProjectStatus,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        contract_number: project.contract_number || '',
        start_date: project.start_date || '',
        deadline: project.deadline || '',
        features: (project.features || []).join('\n'),
        notes: project.notes || '',
        status: project.status || 'briefing',
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setSaving(true);
    try {
      await onSave(project.id, {
        contract_number: formData.contract_number || null,
        start_date: formData.start_date || null,
        deadline: formData.deadline || null,
        features: formData.features
          .split('\n')
          .map((f) => f.trim())
          .filter(Boolean),
        notes: formData.notes || null,
        status: formData.status,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass-card border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold text-marroc-dourado flex items-center gap-2">
            <span className="text-marroc-esmeralda">✎</span> Editar Projeto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_number" className="text-sm text-marroc-salvia/70">Nº do Contrato</Label>
              <Input
                id="contract_number"
                value={formData.contract_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, contract_number: e.target.value }))}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm text-marroc-salvia/70">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-sm text-marroc-salvia/70">Prazo de Entrega</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, deadline: e.target.value }))}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-marroc-salvia/70">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectStatus) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                  {PROJECT_COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.icon} {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-marroc-salvia/70">Funcionalidades (uma por linha)</Label>
            <Textarea
              value={formData.features}
              onChange={(e) => setFormData((prev) => ({ ...prev, features: e.target.value }))}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-marroc-salvia/70">Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda min-h-[80px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-marroc-dourado/15">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-marroc-dourado/15"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-marroc-esmeralda/20 text-marroc-esmeralda border border-marroc-esmeralda/50 hover:bg-marroc-esmeralda/30"
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
