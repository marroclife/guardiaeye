export type ProjectStatus =
  | 'briefing'
  | 'design'
  | 'desenvolvimento'
  | 'revisao'
  | 'entrega'
  | 'concluido'
  | 'pausado';

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string;
  user_id: string | null;
  contract_number: string | null;
  start_date: string | null;
  deadline: string | null;
  features: string[];
  status: ProjectStatus;
  notes: string | null;
  position: number;
}

export interface ProjectWithLead extends Project {
  lead?: {
    id: string;
    name: string;
    company: string | null;
    phone: string | null;
  } | null;
}

export const PROJECT_COLUMNS: {
  id: ProjectStatus;
  title: string;
  icon: string;
  color: string;
}[] = [
  { id: 'briefing', title: 'Briefing', icon: '📋', color: 'border-marroc-salvia/30' },
  { id: 'design', title: 'Design', icon: '🎨', color: 'border-purple-400/30' },
  { id: 'desenvolvimento', title: 'Desenvolvimento', icon: '⚙️', color: 'border-blue-400/30' },
  { id: 'revisao', title: 'Revisão', icon: '🔍', color: 'border-yellow-300/30' },
  { id: 'entrega', title: 'Entrega', icon: '🚀', color: 'border-marroc-dourado/40' },
  { id: 'concluido', title: 'Concluído', icon: '✅', color: 'border-marroc-esmeralda/40' },
  { id: 'pausado', title: 'Pausado', icon: '⏸️', color: 'border-red-400/30' },
];

export const PROJECT_COLUMN_ACCENT_COLORS: Record<ProjectStatus, string> = {
  briefing: 'border-l-marroc-salvia/60',
  design: 'border-l-purple-400/60',
  desenvolvimento: 'border-l-blue-400/60',
  revisao: 'border-l-yellow-300/60',
  entrega: 'border-l-marroc-dourado/70',
  concluido: 'border-l-marroc-esmeralda/70',
  pausado: 'border-l-red-400/60',
};

export function getDaysUntilDeadline(project: Project): number | null {
  if (!project.deadline) return null;
  const deadline = new Date(project.deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffMs = deadline.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function isDeadlineClose(project: Project): boolean {
  const days = getDaysUntilDeadline(project);
  return days !== null && days >= 0 && days <= 7;
}

export function isDeadlineOverdue(project: Project): boolean {
  const days = getDaysUntilDeadline(project);
  return days !== null && days < 0;
}
