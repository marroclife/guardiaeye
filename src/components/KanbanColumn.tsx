import { useState, useRef } from 'react';
import { Lead, LeadStatus, COLUMN_ACCENT_COLORS } from '@/types/lead';
import { LeadCard } from './LeadCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: LeadStatus;
  title: string;
  icon: string;
  color?: string;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onDrop: (leadId: string, newStatus: LeadStatus, newPosition?: number) => void;
  onReorder: (reorderedLeads: { id: string; position: number }[]) => void;
  delay?: number;
  compact?: boolean;
}

export function KanbanColumn({
  id,
  title,
  icon,
  color,
  leads,
  onLeadClick,
  onDrop,
  onReorder,
  delay = 0,
  compact = false,
}: KanbanColumnProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const accentColor = COLUMN_ACCENT_COLORS[id];

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if leaving the container entirely
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    
    const leadId = e.dataTransfer.getData('leadId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus');
    
    if (!leadId) return;

    const targetIndex = dropIndex !== undefined ? dropIndex : leads.length;
    
    // If dropping from another column
    if (sourceStatus !== id) {
      onDrop(leadId, id, targetIndex);
      // Reorder existing leads to make room
      const newOrder = leads.map((lead, idx) => ({
        id: lead.id,
        position: idx >= targetIndex ? idx + 1 : idx,
      }));
      if (newOrder.length > 0) {
        onReorder(newOrder);
      }
    } else {
      // Reordering within same column
      const draggedLeadIndex = leads.findIndex(l => l.id === leadId);
      if (draggedLeadIndex === -1 || draggedLeadIndex === targetIndex) return;

      const newLeads = [...leads];
      const [draggedLead] = newLeads.splice(draggedLeadIndex, 1);
      const adjustedIndex = targetIndex > draggedLeadIndex ? targetIndex - 1 : targetIndex;
      newLeads.splice(adjustedIndex, 0, draggedLead);

      const newOrder = newLeads.map((lead, idx) => ({
        id: lead.id,
        position: idx,
      }));
      onReorder(newOrder);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.setData('sourceStatus', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Calculate column stats
  const totalValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const hasValue = totalValue > 0;

  return (
    <div
      className={cn(
        'flex flex-col boot-fade-in',
        compact 
          ? 'w-full min-w-0' 
          : 'min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px]'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Column Header */}
      <div className={cn(
        'glass-card px-3 py-2.5 md:px-4 md:py-3 mb-2 md:mb-3 flex items-center justify-between border-l-2 rounded-lg',
        color || 'border-marroc-dourado/25'
      )}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{icon}</span>
          <h3 className="font-display font-semibold text-marroc-dourado text-xs md:text-sm tracking-wide truncate">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-light text-xs px-2 py-0.5 bg-marroc-dourado/10 border border-marroc-dourado/20 rounded-full text-marroc-dourado">
            {leads.length}
          </span>
          {hasValue && !compact && (
            <span className="font-display text-xs font-semibold text-marroc-esmeralda hidden md:block">
              R$ {totalValue.toLocaleString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 rounded-xl border border-marroc-dourado/15 p-2 md:p-3 transition-colors duration-200 overflow-y-auto',
          compact ? 'min-h-[140px] max-h-[36vh]' : 'min-h-[300px] md:min-h-[400px] max-h-[calc(100vh-280px)]'
        )}
        onDragOver={(e) => handleDragOver(e, leads.length)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, leads.length)}
      >
        {leads.map((lead, index) => (
          <div
            key={lead.id}
            draggable
            onDragStart={(e) => handleDragStart(e, lead.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={cn(
              'transition-all duration-200',
              dragOverIndex === index && 'pt-12'
            )}
          >
            <LeadCard 
              lead={lead} 
              onClick={() => onLeadClick(lead)} 
              accentColor={accentColor}
              compact={compact}
            />
          </div>
        ))}
        
        {leads.length === 0 && (
          <div 
            className={cn(
              "flex items-center justify-center text-marroc-salvia/60 text-[10px] text-center border border-dashed border-marroc-dourado/15 rounded-lg transition-all px-2",
              compact ? 'h-12' : 'h-24',
              dragOverIndex !== null && "bg-marroc-dourado/5 border-marroc-esmeralda/30"
            )}
            onDragOver={(e) => handleDragOver(e, 0)}
            onDrop={(e) => handleDrop(e, 0)}
          >
            {compact ? 'Vazio' : 'Arraste leads aqui'}
          </div>
        )}
      </div>
    </div>
  );
}
