import { useState, useRef } from 'react';
import { ProjectStatus, PROJECT_COLUMN_ACCENT_COLORS } from '@/types/project';
import { ProjectCard } from './ProjectCard';
import { ProjectWithLead } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectKanbanColumnProps {
  id: ProjectStatus;
  title: string;
  icon: string;
  color?: string;
  projects: ProjectWithLead[];
  onProjectClick: (project: ProjectWithLead) => void;
  onDrop?: (projectId: string, newStatus: ProjectStatus, newPosition?: number) => void;
  onReorder?: (reorderedProjects: { id: string; position: number }[]) => void;
  delay?: number;
  compact?: boolean;
}

export function ProjectKanbanColumn({
  id,
  title,
  icon,
  color,
  projects,
  onProjectClick,
  onDrop,
  onReorder,
  delay = 0,
  compact = false,
}: ProjectKanbanColumnProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const accentColor = PROJECT_COLUMN_ACCENT_COLORS[id];

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    if (!onDrop) return;
    e.preventDefault();
    e.stopPropagation();
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex?: number) => {
    if (!onDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);

    const projectId = e.dataTransfer.getData('projectId');
    const sourceStatus = e.dataTransfer.getData('sourceStatus');

    if (!projectId) return;

    const targetIndex = dropIndex !== undefined ? dropIndex : projects.length;

    if (sourceStatus !== id) {
      onDrop(projectId, id, targetIndex);
      if (onReorder) {
        const newOrder = projects.map((project, idx) => ({
          id: project.id,
          position: idx >= targetIndex ? idx + 1 : idx,
        }));
        if (newOrder.length > 0) onReorder(newOrder);
      }
    } else {
      const draggedProjectIndex = projects.findIndex((p) => p.id === projectId);
      if (draggedProjectIndex === -1 || draggedProjectIndex === targetIndex) return;

      const newProjects = [...projects];
      const [draggedProject] = newProjects.splice(draggedProjectIndex, 1);
      const adjustedIndex = targetIndex > draggedProjectIndex ? targetIndex - 1 : targetIndex;
      newProjects.splice(adjustedIndex, 0, draggedProject);

      const newOrder = newProjects.map((project, idx) => ({
        id: project.id,
        position: idx,
      }));
      onReorder?.(newOrder);
    }
  };

  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    if (!onDrop) return;
    e.dataTransfer.setData('projectId', projectId);
    e.dataTransfer.setData('sourceStatus', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const overdueCount = projects.filter((p) => p.deadline && new Date(p.deadline) < new Date()).length;

  return (
    <div
      className={cn(
        'flex flex-col boot-fade-in',
        compact ? 'w-full min-w-0' : 'min-w-[280px] w-[280px] md:min-w-[300px] md:w-[300px]'
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
          {overdueCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
              {overdueCount} atrasado{overdueCount > 1 ? 's' : ''}
            </span>
          )}
          <span className="font-light text-xs px-2 py-0.5 bg-marroc-dourado/10 border border-marroc-dourado/20 rounded-full text-marroc-dourado">
            {projects.length}
          </span>
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 rounded-xl border border-marroc-dourado/15 p-2 md:p-3 transition-colors duration-200 overflow-y-auto',
          compact ? 'min-h-[180px] max-h-[40vh]' : 'min-h-[300px] md:min-h-[400px] max-h-[calc(100vh-280px)]'
        )}
        onDragOver={(e) => handleDragOver(e, projects.length)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, projects.length)}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            draggable={!!onDrop}
            onDragStart={(e) => handleDragStart(e, project.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={cn(
              'transition-all duration-200',
              dragOverIndex === index && 'pt-12'
            )}
          >
            <ProjectCard
              project={project}
              onClick={() => onProjectClick(project)}
              accentColor={accentColor}
              compact={compact}
            />
          </div>
        ))}

        {projects.length === 0 && (
          <div
            className={cn(
              "flex items-center justify-center text-marroc-salvia/70 text-xs border border-dashed border-marroc-dourado/15 rounded-lg transition-all",
              compact ? 'h-16' : 'h-24',
              dragOverIndex !== null && "bg-marroc-dourado/5 border-marroc-esmeralda/30"
            )}
            onDragOver={(e) => handleDragOver(e, 0)}
            onDrop={(e) => handleDrop(e, 0)}
          >
            Arraste projetos aqui
          </div>
        )}
      </div>
    </div>
  );
}
