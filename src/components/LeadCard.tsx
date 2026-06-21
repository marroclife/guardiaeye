import { Lead, LeadPriority, LEAD_SOURCES, isLeadStale, getDaysSinceContact } from '@/types/lead';
import { Building2, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  isDragging?: boolean;
  accentColor?: string;
  compact?: boolean;
}

const priorityConfig: Record<LeadPriority, { label: string; className: string }> = {
  low: { label: 'Frio', className: 'temp-tag-cold' },
  medium: { label: 'Morno', className: 'temp-tag-warm' },
  high: { label: 'Quente', className: 'temp-tag-hot' },
};

export function LeadCard({ lead, onClick, isDragging, accentColor, compact = false }: LeadCardProps) {
  const priority = priorityConfig[lead.priority || 'medium'];
  const source = LEAD_SOURCES.find(s => s.id === lead.source);
  const stale = isLeadStale(lead);
  const daysSince = getDaysSinceContact(lead);
  
  const formatValue = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'kanban-card border-l-2 cursor-pointer active:scale-[0.99] transition-transform',
        compact ? 'p-2.5 mb-2' : 'p-4 mb-3',
        accentColor || 'border-l-white/20',
        isDragging && 'dragging',
        stale && 'border-orange-500/50 bg-orange-500/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-1.5 md:mb-2">
        <h4 className={cn(
          "font-display font-medium text-marroc-dourado truncate flex-1 mr-2 leading-snug",
          compact ? "text-xs" : "text-sm"
        )}>
          {lead.name}
        </h4>
        <span className={cn(
          "px-2 py-0.5 rounded text-xs font-mono flex-shrink-0",
          compact ? "text-[10px] px-1.5" : "",
          priority.className
        )}>
          {priority.label}
        </span>
      </div>

      {/* Company */}
      {lead.company && (
        <div className={cn(
          "flex items-center gap-2 text-marroc-salvia/70 mb-1",
          compact ? "text-[10px]" : "text-xs"
        )}>
          <Building2 className={cn("text-marroc-esmeralda", compact ? "w-3 h-3" : "w-3 h-3")} />
          <span className="truncate">{lead.company}</span>
        </div>
      )}

      {/* Source Badge */}
      {source && !compact && (
        <div className="flex items-center gap-1.5 text-xs text-marroc-salvia/70 mb-1.5">
          <span>{source.icon}</span>
          <span>{source.label}</span>
        </div>
      )}

      {/* Value */}
      {lead.value && lead.value > 0 && (
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className={cn("text-marroc-salvia", compact ? "w-3 h-3" : "w-3 h-3")} />
          <span className={cn("font-mono text-marroc-salvia", compact ? "text-[10px]" : "text-xs")}>
            {formatValue(lead.value)}
          </span>
        </div>
      )}

      {/* Footer - Last Contact & Stale Warning */}
      <div className={cn(
        "flex items-center justify-between border-t border-marroc-dourado/15",
        compact ? "mt-1.5 pt-1.5" : "mt-2 pt-2"
      )}>
        <div className={cn(
          "flex items-center gap-1.5 text-marroc-salvia/70 font-light",
          compact ? "text-[10px]" : "text-xs"
        )}>
          <Clock className={cn("", compact ? "w-3 h-3" : "w-3 h-3")} />
          <span>{formatDate(lead.last_contact_at)}</span>
        </div>
        
        {stale && (
          <div className={cn(
            "flex items-center gap-1 text-amber-300/90 font-light",
            compact ? "text-[10px]" : "text-xs"
          )}>
            <AlertTriangle className={cn("", compact ? "w-3 h-3" : "w-3 h-3")} />
            <span>{daysSince}d parado</span>
          </div>
        )}
      </div>
    </div>
  );
}
