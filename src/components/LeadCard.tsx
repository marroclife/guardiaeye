import { Lead, LeadPriority } from '@/types/lead';
import { Building2, DollarSign } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  isDragging?: boolean;
}

const priorityConfig: Record<LeadPriority, { label: string; className: string }> = {
  low: { label: 'Frio', className: 'temp-tag-cold' },
  medium: { label: 'Morno', className: 'temp-tag-warm' },
  high: { label: 'Quente', className: 'temp-tag-hot' },
};

export function LeadCard({ lead, onClick, isDragging }: LeadCardProps) {
  const priority = priorityConfig[lead.priority || 'medium'];
  
  const formatValue = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      onClick={onClick}
      className={`kanban-card p-4 mb-3 ${isDragging ? 'dragging' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-foreground truncate flex-1 mr-2">
          {lead.name}
        </h4>
        <span className={`px-2 py-0.5 rounded text-xs font-mono ${priority.className}`}>
          {priority.label}
        </span>
      </div>

      {/* Company */}
      {lead.company && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Building2 className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="truncate">{lead.company}</span>
        </div>
      )}

      {/* Value */}
      {lead.value && (
        <div className="flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-neon-green" />
          <span className="font-mono text-sm text-neon-green">
            {formatValue(lead.value)}
          </span>
        </div>
      )}

      {/* Role if no company/value */}
      {!lead.company && !lead.value && lead.role && (
        <p className="text-sm text-muted-foreground truncate">{lead.role}</p>
      )}
    </div>
  );
}
