export type LeadStatus = 
  | 'triagem' 
  | 'em_contato' 
  | 'sem_resposta' 
  | 'em_espera' 
  | 'proposta' 
  | 'fechado';

export type LeadPriority = 'low' | 'medium' | 'high';

export type LeadSource = 
  | 'whatsapp' 
  | 'instagram' 
  | 'site' 
  | 'indicacao' 
  | 'prospeccao' 
  | 'evento' 
  | 'manual';

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
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
  archived: boolean;
  obs: string | null;
  source: LeadSource;
  last_contact_at: string;
  position: number;
}

// Map column status to accent color class
export const COLUMN_ACCENT_COLORS: Record<LeadStatus, string> = {
  triagem: 'border-l-marroc-salvia/60',
  em_contato: 'border-l-blue-400/60',
  sem_resposta: 'border-l-amber-400/60',
  em_espera: 'border-l-yellow-300/50',
  proposta: 'border-l-marroc-dourado/70',
  fechado: 'border-l-marroc-esmeralda/70',
};

export const LEAD_SOURCES: { id: LeadSource; label: string; icon: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'site', label: 'Site', icon: '🌐' },
  { id: 'indicacao', label: 'Indicação', icon: '🤝' },
  { id: 'prospeccao', label: 'Prospecção', icon: '🎯' },
  { id: 'evento', label: 'Evento', icon: '📅' },
  { id: 'manual', label: 'Manual', icon: '✏️' },
];

export const KANBAN_COLUMNS: { id: LeadStatus; title: string; icon: string; color: string }[] = [
  { id: 'triagem', title: 'Triagem', icon: '📥', color: 'border-marroc-salvia/30' },
  { id: 'em_contato', title: 'Em Contato', icon: '📞', color: 'border-blue-400/30' },
  { id: 'sem_resposta', title: 'Sem Resposta', icon: '⏳', color: 'border-amber-400/30' },
  { id: 'em_espera', title: 'Em Espera', icon: '⏸️', color: 'border-yellow-300/30' },
  { id: 'proposta', title: 'Proposta Enviada', icon: '📜', color: 'border-marroc-dourado/40' },
  { id: 'fechado', title: 'Fechado', icon: '🚀', color: 'border-marroc-esmeralda/40' },
];

// Stale lead threshold in days
export const STALE_LEAD_DAYS = 3;

// Helper to check if a lead is stale (no contact for X days)
export function isLeadStale(lead: Lead): boolean {
  const lastContact = new Date(lead.last_contact_at);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays >= STALE_LEAD_DAYS;
}

// Helper to get days since last contact
export function getDaysSinceContact(lead: Lead): number {
  const lastContact = new Date(lead.last_contact_at);
  const now = new Date();
  return Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
}
