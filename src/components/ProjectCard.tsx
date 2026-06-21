import { ProjectWithLead, PROJECT_COLUMN_ACCENT_COLORS, getDaysUntilDeadline, isDeadlineClose, isDeadlineOverdue } from '@/types/project';
import { Calendar, ClipboardList, AlertTriangle, AlertCircle, CheckCircle2, Building2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: ProjectWithLead;
  onClick: () => void;
  isDragging?: boolean;
  compact?: boolean;
}

export function ProjectCard({ project, onClick, isDragging, compact = false }: ProjectCardProps) {
  const accentColor = PROJECT_COLUMN_ACCENT_COLORS[project.status];
  const daysUntil = getDaysUntilDeadline(project);
  const closeDeadline = isDeadlineClose(project);
  const overdue = isDeadlineOverdue(project);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const companyName = project.lead?.company || project.lead?.name || 'Empresa não informada';

  return (
    <div
      onClick={onClick}
      className={cn(
        'kanban-card border-l-2 cursor-pointer active:scale-[0.99] transition-transform',
        compact ? 'p-2.5 mb-2' : 'p-4 mb-3',
        accentColor,
        isDragging && 'dragging',
        overdue && 'border-red-500/50 bg-red-500/5',
        closeDeadline && !overdue && 'border-amber-500/50 bg-amber-500/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-1.5 md:mb-2">
        <h4 className={cn(
          "font-display font-medium text-marroc-dourado flex-1 leading-snug min-w-0",
          compact ? "text-xs truncate" : "text-sm truncate"
        )}
        >
          {companyName}
        </h4>
        {project.contract_number && (
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-mono flex-shrink-0 whitespace-nowrap bg-marroc-dourado/10 text-marroc-dourado border border-marroc-dourado/20",
            compact && "text-[10px] px-1.5"
          )}
          >
            #{project.contract_number}
          </span>
        )}
      </div>

      {/* Contact */}
      {project.lead?.phone && (
        <div className={cn(
          "flex items-center gap-2 text-marroc-salvia/70 mb-1 min-w-0",
          compact ? "text-[10px]" : "text-xs"
        )}
        >
          <Phone className={cn("text-marroc-esmeralda flex-shrink-0", compact ? "w-3 h-3" : "w-3 h-3")} />
          <span className="truncate">{project.lead.phone}</span>
        </div>
      )}

      {/* Dates */}
      <div className={cn(
        "flex items-center justify-between mb-1 gap-2",
        compact ? "text-[10px]" : "text-xs"
      )}
      >
        <div className="flex items-center gap-1.5 text-marroc-salvia/70 min-w-0">
          <Calendar className={cn("text-marroc-salvia flex-shrink-0", compact ? "w-3 h-3" : "w-3 h-3")} />
          <span className="truncate">{formatDate(project.start_date)} → {formatDate(project.deadline)}</span>
        </div>
      </div>

      {/* Features */}
      {!compact && project.features && project.features.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {project.features.slice(0, 3).map((feature, index) => (
            <span
              key={index}
              className="px-2 py-0.5 rounded text-[10px] bg-marroc-esmeralda/10 text-marroc-esmeralda border border-marroc-esmeralda/20"
            >
              {feature}
            </span>
          ))}
          {project.features.length > 3 && (
            <span className="px-2 py-0.5 rounded text-[10px] text-marroc-salvia/70">
              +{project.features.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Deadline alert */}
      <div className={cn(
        "flex items-center justify-between border-t border-marroc-dourado/15 gap-2",
        compact ? "mt-1.5 pt-1.5" : "mt-2 pt-2"
      )}>
        <div className={cn(
          "flex items-center gap-1.5 font-light min-w-0",
          compact ? "text-[10px]" : "text-xs",
          overdue && "text-red-300",
          closeDeadline && !overdue && "text-amber-300",
          !closeDeadline && !overdue && "text-marroc-salvia/70"
        )}
        >
          {overdue ? (
            <>
              <AlertTriangle className={cn("flex-shrink-0", compact ? "w-3 h-3" : "w-3 h-3")} />
              <span className="truncate">Atrasado {Math.abs(daysUntil || 0)}d</span>
            </>
          ) : closeDeadline ? (
            <>
              <AlertCircle className={cn("flex-shrink-0", compact ? "w-3 h-3" : "w-3 h-3")} />
              <span className="truncate">Faltam {daysUntil}d</span>
            </>
          ) : (
            <>
              <ClipboardList className={cn("flex-shrink-0", compact ? "w-3 h-3" : "w-3 h-3")} />
              <span className="truncate">{project.features.length} func.</span>
            </>
          )}
        </div>
        {project.status === 'concluido' && (
          <CheckCircle2 className={cn("text-marroc-esmeralda flex-shrink-0", compact ? "w-3 h-3" : "w-4 h-4")} />
        )}
      </div>
    </div>
  );
}
