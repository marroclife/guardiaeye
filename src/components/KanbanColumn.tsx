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
      className="flex flex-col min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px] boot-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Column Header */}
      <div className={cn(
        'glass-card px-4 py-3 mb-3 flex items-center justify-between border-l-2 rounded-lg',
        color || 'border-marroc-dourado/25'
      )}>
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <h3 className="font-display font-semibold text-marroc-dourado text-sm tracking-wide">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-light text-xs px-2.5 py-0.5 bg-marroc-dourado/10 border border-marroc-dourado/20 rounded-full text-marroc-dourado">
            {leads.length}
          </span>
          {hasValue && (
            <span className="font-display text-xs font-semibold text-marroc-esmeralda hidden md:block">
              R$ {totalValue.toLocaleString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[300px] md:min-h-[400px] rounded-xl border border-marroc-dourado/15 p-2 md:p-3 transition-colors duration-200 overflow-y-auto max-h-[calc(100vh-280px)]"
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
            />
          </div>
        ))}
        
        {leads.length === 0 && (
          <div 
            className={cn(
              "flex items-center justify-center h-24 text-marroc-salvia/70 text-xs border border-dashed border-marroc-dourado/15 rounded-lg transition-all",
              dragOverIndex !== null && "bg-marroc-dourado/5 border-marroc-esmeralda/30"
            )}
            onDragOver={(e) => handleDragOver(e, 0)}
            onDrop={(e) => handleDrop(e, 0)}
          >
            Arraste leads aqui
          </div>
        )}
      </div>
    </div>
  );
}
