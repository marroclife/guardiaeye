import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectKanbanColumn } from '@/components/ProjectKanbanColumn';
import { ProjectDetailSheet } from '@/components/ProjectDetailSheet';
import { AddProjectModal } from '@/components/AddProjectModal';
import { EditProjectModal } from '@/components/EditProjectModal';
import { MetricCard } from '@/components/MetricCard';
import { Project, ProjectStatus, ProjectWithLead, PROJECT_COLUMNS } from '@/types/project';
import { Briefcase, Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

const MOBILE_COLUMN_PAIRS: [string, string][] = [
  ['briefing', 'design'],
  ['desenvolvimento', 'revisao'],
  ['entrega', 'concluido'],
];

export function ProjectsView() {
  const {
    projects,
    loading,
    isConnected,
    updateProjectStatus,
    updateProject,
    createProject,
    deleteProject,
    reorderProjects,
    getClosedLeadsWithoutProject,
  } = useProjects();

  const [selectedProject, setSelectedProject] = useState<ProjectWithLead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const projectsByStatus = useMemo(() => {
    const grouped: Record<string, ProjectWithLead[]> = {};
    PROJECT_COLUMNS.forEach((col) => {
      grouped[col.id] = projects
        .filter((p) => p.status === col.id)
        .sort((a, b) => a.position - b.position);
    });
    return grouped;
  }, [projects]);

  const metrics = useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status !== 'concluido' && p.status !== 'pausado').length;
    const completed = projects.filter((p) => p.status === 'concluido').length;
    const overdue = projects.filter((p) => {
      if (!p.deadline) return false;
      return new Date(p.deadline) < new Date();
    }).length;

    return { total, active, completed, overdue };
  }, [projects]);

  const handleProjectClick = (project: ProjectWithLead) => {
    setSelectedProject(project);
    setSheetOpen(true);
  };

  const handleDrop = (projectId: string, newStatus: ProjectStatus, newPosition?: number) => {
    updateProjectStatus(projectId, newStatus, newPosition);
  };

  const handleReorder = (reorderedProjects: { id: string; position: number }[]) => {
    reorderProjects(reorderedProjects);
  };

  const handleEditProject = (project: ProjectWithLead) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (projectId: string, updates: Partial<Project>) => {
    await updateProject(projectId, updates);
  };

  const renderKanbanColumn = (columnId: string, index: number, isMobilePair = false) => {
    const column = PROJECT_COLUMNS.find((c) => c.id === columnId);
    if (!column) return null;
    return (
      <ProjectKanbanColumn
        key={column.id}
        id={column.id}
        title={column.title}
        icon={column.icon}
        color={column.color}
        projects={projectsByStatus[column.id] || []}
        onProjectClick={handleProjectClick}
        onDrop={handleDrop}
        onReorder={handleReorder}
        delay={index * 100}
        compact={isMobilePair}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-marroc-esmeralda" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-marroc-salvia/70 md:hidden">
          Status: {isConnected ? 'Online' : 'Offline'}
        </div>
        <div className="ml-auto">
          <AddProjectModal onAdd={createProject} getClosedLeads={getClosedLeadsWithoutProject} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard
          title="Total de Projetos"
          value={metrics.total}
          subtitle="ativos + concluídos"
          icon={Briefcase}
          iconColor="text-marroc-esmeralda"
          delay={100}
        />
        <MetricCard
          title="Em Andamento"
          value={metrics.active}
          subtitle="projetos ativos"
          icon={Clock}
          iconColor="text-marroc-dourado"
          delay={200}
        />
        <MetricCard
          title="Concluídos"
          value={metrics.completed}
          subtitle="entregues"
          icon={CheckCircle2}
          iconColor="text-marroc-esmeralda"
          delay={300}
        />
        <MetricCard
          title="Atrasados"
          value={metrics.overdue}
          subtitle="prazo vencido"
          icon={AlertTriangle}
          iconColor="text-red-400"
          delay={400}
        />
      </div>

      {/* Desktop Kanban */}
      <div className="hidden md:flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-3 px-3 md:mx-0 md:px-0">
        {PROJECT_COLUMNS.map((column, index) => (
          <ProjectKanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            icon={column.icon}
            color={column.color}
            projects={projectsByStatus[column.id] || []}
            onProjectClick={handleProjectClick}
            onDrop={handleDrop}
            onReorder={handleReorder}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Mobile Kanban Grid — 2 columns per row */}
      <div className="md:hidden space-y-4">
        {MOBILE_COLUMN_PAIRS.map((pair, pairIndex) => (
          <div key={pairIndex} className="grid grid-cols-2 gap-3">
            {pair.map((colId, colIndex) => renderKanbanColumn(colId, pairIndex * 2 + colIndex, true)
            )}
          </div>
        ))}

        {/* Pausado fica sozinho na última linha */}
        <div className="grid grid-cols-2 gap-3">
          {renderKanbanColumn('pausado', MOBILE_COLUMN_PAIRS.length * 2, true)}
          <div />
        </div>
      </div>

      {/* Detail Sheet */}
      <ProjectDetailSheet
        project={selectedProject}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={handleEditProject}
        onDelete={deleteProject}
      />

      {/* Edit Modal */}
      <EditProjectModal
        project={selectedProject}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
