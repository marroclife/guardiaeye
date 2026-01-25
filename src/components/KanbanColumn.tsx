import { Lead, LeadStatus } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  icon: string;
  color?: string;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDrop: (leadId: string, newStatus: LeadStatus) => void;
  delay?: number;
}

export function KanbanColumn({
  id,
  title,
  icon,
  color,
  leads,
  onLeadClick,
  onDrop,
  delay = 0,
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-white/5');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-white/5');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-white/5');
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onDrop(leadId, id);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Calculate column stats
  const totalValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const hasValue = totalValue > 0;

  return (
    <div
      className="flex flex-col min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px] boot-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Column Header */}
      <div className={cn(
        'glass-card px-3 py-2.5 mb-3 flex items-center justify-between border-l-2',
        color || 'border-white/20'
      )}>
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="font-medium text-foreground text-sm">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2 py-0.5 bg-white/5 rounded-full text-muted-foreground">
            {leads.length}
          </span>
          {hasValue && (
            <span className="font-mono text-xs text-neon-green hidden md:block">
              R$ {totalValue.toLocaleString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div
        className="flex-1 min-h-[300px] md:min-h-[400px] rounded-xl border border-white/5 p-2 md:p-3 transition-colors duration-200 overflow-y-auto max-h-[calc(100vh-280px)]"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {leads.map((lead) => (
          <div
            key={lead.id}
            draggable
            onDragStart={(e) => handleDragStart(e, lead.id)}
          >
            <LeadCard lead={lead} onClick={() => onLeadClick(lead)} />
          </div>
        ))}
        
        {leads.length === 0 && (
          <div className="flex items-center justify-center h-24 text-muted-foreground text-xs border border-dashed border-white/10 rounded-lg">
            Arraste leads aqui
          </div>
        )}
      </div>
    </div>
  );
}
