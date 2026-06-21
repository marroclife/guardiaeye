import { cn } from '@/lib/utils';
import { ProjectWithLead, PROJECT_COLUMNS, getDaysUntilDeadline, isDeadlineClose, isDeadlineOverdue } from '@/types/project';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Building2, Phone, Calendar, ClipboardList, FileText, Tag, Clock, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ProjectDetailSheetProps {
  project: ProjectWithLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (project: ProjectWithLead) => void;
  onDelete: (projectId: string) => void;
}

export function ProjectDetailSheet({
  project,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProjectDetailSheetProps) {
  const [deleting, setDeleting] = useState(false);

  if (!project) return null;

  const daysUntil = getDaysUntilDeadline(project);
  const closeDeadline = isDeadlineClose(project);
  const overdue = isDeadlineOverdue(project);
  const statusLabel = PROJECT_COLUMNS.find((c) => c.id === project.status)?.title || project.status;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja remover este projeto?')) return;
    setDeleting(true);
    try {
      await onDelete(project.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg glass-card border-l border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-marroc-dourado/15">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold text-marroc-texto flex items-center gap-2">
                {project.lead?.company || project.lead?.name || 'Projeto'}
              </SheetTitle>
              {project.contract_number && (
                <p className="text-sm text-marroc-esmeralda mt-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Contrato #{project.contract_number}
                </p>
              )}
            </div>
            <span className="px-3 py-1 rounded text-xs font-mono bg-marroc-dourado/10 text-marroc-dourado border border-marroc-dourado/20">
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-marroc-salvia/70">
            <span className="font-mono">ID: {project.id.slice(0, 8)}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Atualizado {new Date(project.updated_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <InfoRow icon={Building2} label="Empresa" value={project.lead?.company || project.lead?.name || '—'} />
          <InfoRow icon={Phone} label="Contato" value={project.lead?.phone || '—'} />
          <InfoRow
            icon={Calendar}
            label="Período"
            value={`${formatDate(project.start_date)} → ${formatDate(project.deadline)}`}
            highlight={!!project.deadline}
          />

          <div className={cn(
            "flex items-center gap-2 p-3 rounded-lg border",
            overdue && "bg-red-500/10 border-red-500/30 text-red-300",
            closeDeadline && !overdue && "bg-amber-500/10 border-amber-500/30 text-amber-300",
            !closeDeadline && !overdue && "bg-marroc-esmeralda/10 border-marroc-esmeralda/30 text-marroc-esmeralda"
          )}
          >
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              {overdue
                ? `Atrasado ${Math.abs(daysUntil || 0)} dias`
                : closeDeadline
                ? `Faltam ${daysUntil} dias para o prazo`
                : project.deadline
                ? `${daysUntil} dias restantes`
                : 'Sem prazo definido'}
            </span>
          </div>

          <div className="pt-3 border-t border-marroc-dourado/15">
            <div className="flex items-center gap-2 mb-3 text-marroc-salvia/70">
              <ClipboardList className="w-4 h-4" />
              <span className="text-sm">Funcionalidades</span>
            </div>
            {project.features && project.features.length > 0 ? (
              <ul className="space-y-2">
                {project.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-marroc-texto/80 bg-marroc-dourado/5 p-2.5 rounded-lg"
                  >
                    <span className="text-marroc-esmeralda mt-0.5">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-marroc-salvia/70 opacity-60">Nenhuma funcionalidade cadastrada.</p>
            )}
          </div>

          {project.notes && (
            <div className="pt-3 border-t border-marroc-dourado/15">
              <div className="flex items-center gap-2 mb-2 text-marroc-salvia/70">
                <FileText className="w-4 h-4" />
                <span className="text-sm">Observações</span>
              </div>
              <p className="text-sm text-marroc-texto/80 whitespace-pre-wrap bg-marroc-dourado/5 p-3 rounded-lg">
                {project.notes}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-marroc-dourado/15 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 border-marroc-dourado/15 hover:bg-marroc-dourado/5 hover:border-marroc-esmeralda/50"
              onClick={() => {
                onEdit(project);
                onOpenChange(false);
              }}
            >
              <Pencil className="w-4 h-4 text-marroc-esmeralda" />
              Editar Projeto
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 border-marroc-dourado/15 hover:bg-red-500/10 hover:border-destructive/50 hover:text-red-300"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Remover Projeto
            </Button>
          </div>
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
        {value || '—'}
      </span>
    </div>
  );
}
