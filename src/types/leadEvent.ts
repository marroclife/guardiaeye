export type LeadEventType = 'reuniao' | 'contato' | 'proposta' | 'follow_up' | 'outro';

export interface LeadEvent {
  id: string;
  lead_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  type: LeadEventType;
  scheduled_at: string;
  duration_minutes: number | null;
  notes: string | null;
  completed: boolean;
  completed_at: string | null;
}

export const LEAD_EVENT_TYPES: { id: LeadEventType; label: string; icon: string; color: string }[] = [
  { id: 'reuniao', label: 'Reunião', icon: '🤝', color: 'bg-marroc-esmeralda/20 text-marroc-esmeralda border-marroc-esmeralda/40' },
  { id: 'contato', label: 'Contato', icon: '📞', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { id: 'proposta', label: 'Proposta', icon: '📜', color: 'bg-marroc-dourado/15 text-marroc-dourado border-marroc-dourado/40' },
  { id: 'follow_up', label: 'Follow-up', icon: '↻', color: 'bg-amber-500/15 text-amber-200 border-amber-500/30' },
  { id: 'outro', label: 'Outro', icon: '📝', color: 'bg-marroc-salvia/15 text-marroc-salvia border-marroc-salvia/30' },
];

export function formatEventDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function formatEventDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatEventTime(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function isEventToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function isEventPast(dateStr: string, completed: boolean): boolean {
  if (completed) return false;
  return new Date(dateStr) < new Date();
}
