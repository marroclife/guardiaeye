export type LeadStatus = 'triagem' | 'qualificado' | 'proposta' | 'fechado';
export type LeadPriority = 'low' | 'medium' | 'high';

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  role: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  status: LeadStatus;
  ai_summary: string | null;
  value: number | null;
  priority: LeadPriority;
  updated_at: string;
  archived: boolean;
}

export const KANBAN_COLUMNS: { id: LeadStatus; title: string; icon: string }[] = [
  { id: 'triagem', title: 'Triagem Neural', icon: '📥' },
  { id: 'qualificado', title: 'Qualificados', icon: '💎' },
  { id: 'proposta', title: 'Em Proposta', icon: '📜' },
  { id: 'fechado', title: 'Protocolo Ativado', icon: '🚀' },
];
