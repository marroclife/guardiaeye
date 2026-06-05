import { Lead, LeadPriority, LEAD_SOURCES, isLeadStale, getDaysSinceContact } from '@/types/lead';
import { Building2, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  isDragging?: boolean;
  accentColor?: string;
}

const priorityConfig: Record<LeadPriority, { label: string; className: string }> = {
  low: { label: 'Frio', className: 'temp-tag-cold' },
  medium: { label: 'Morno', className: 'temp-tag-warm' },
  high: { label: 'Quente', className: 'temp-tag-hot' },
};

export function LeadCard({ lead, onClick, isDragging, accentColor }: LeadCardProps) {
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
        'kanban-card p-4 mb-3 border-l-2',
        accentColor || 'border-l-white/20',
        isDragging && 'dragging',
        stale && 'border-orange-500/50 bg-orange-500/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-display font-medium text-marroc-dourado truncate flex-1 mr-2 text-sm leading-snug">
          {lead.name}
        </h4>
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${priority.className}`}>
          {priority.label}
        </span>
      </div>

      {/* Company */}
      {lead.company && (
        <div className="flex items-center gap-2 text-xs text-marroc-salvia/70 mb-1.5">
          <Building2 className="w-3 h-3 text-marroc-esmeralda" />
          <span className="truncate">{lead.company}</span>
        </div>
      )}

      {/* Source Badge */}
      {source && (
        <div className="flex items-center gap-1.5 text-xs text-marroc-salvia/70 mb-1.5">
          <span>{source.icon}</span>
          <span>{source.label}</span>
        </div>
      )}

      {/* Value */}
      {lead.value && lead.value > 0 && (
        <div className="flex items-center gap-2 mb-1.5">
          <DollarSign className="w-3 h-3 text-marroc-salvia" />
          <span className="font-mono text-xs text-marroc-salvia">
            {formatValue(lead.value)}
          </span>
        </div>
      )}

      {/* Footer - Last Contact & Stale Warning */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-marroc-dourado/15">
        <div className="flex items-center gap-1.5 text-xs text-marroc-salvia/70 font-light">
          <Clock className="w-3 h-3" />
          <span>{formatDate(lead.last_contact_at)}</span>
        </div>
        
        {stale && (
          <div className="flex items-center gap-1 text-xs text-amber-300/90 font-light">
            <AlertTriangle className="w-3 h-3" />
            <span>{daysSince}d parado</span>
          </div>
        )}
      </div>
    </div>
  );
}
