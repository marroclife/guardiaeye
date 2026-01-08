import { Lead, LeadStatus } from '@/types/lead';
import { LeadCard } from './LeadCard';

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  icon: string;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDrop: (leadId: string, newStatus: LeadStatus) => void;
  delay?: number;
}

export function KanbanColumn({
  id,
  title,
  icon,
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

  return (
    <div
      className="flex flex-col min-w-[300px] w-[300px] boot-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Column Header */}
      <div className="glass-card px-4 py-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-medium text-foreground">{title}</h3>
        </div>
        <span className="font-mono text-xs px-2 py-1 bg-white/5 rounded-full text-muted-foreground">
          {leads.length}
        </span>
      </div>

      {/* Cards Container */}
      <div
        className="flex-1 min-h-[400px] rounded-xl border border-white/5 p-3 transition-colors duration-200"
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
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border border-dashed border-white/10 rounded-lg">
            Arraste leads aqui
          </div>
        )}
      </div>
    </div>
  );
}
