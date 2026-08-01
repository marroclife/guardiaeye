import { Lead } from '@/types/lead';
import { LeadEvent, isEventPast, isEventToday } from '@/types/leadEvent';
import { ProjectWithLead, isDeadlineClose, isDeadlineOverdue } from '@/types/project';
import { SystemContext } from './types';

export function buildSystemContext(
  leads: Lead[],
  events: LeadEvent[],
  projects: ProjectWithLead[],
  userEmail: string | null
): SystemContext {
  return {
    leads,
    activeLeads: leads.filter((l) => !l.archived),
    archivedLeads: leads.filter((l) => l.archived),
    events,
    projects,
    today: new Date().toISOString(),
    userEmail,
  };
}

export function formatSystemContext(ctx: SystemContext): string {
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const activeLeads = ctx.activeLeads
    .sort((a, b) => (b.value || 0) - (a.value || 0))
    .slice(0, 30);

  const overdueEvents = ctx.events
    .filter((e) => !e.completed && isEventPast(e.scheduled_at, false))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const todayEvents = ctx.events
    .filter((e) => !e.completed && isEventToday(e.scheduled_at))
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const upcomingEvents = ctx.events
    .filter((e) => !e.completed && new Date(e.scheduled_at) > new Date())
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    .slice(0, 20);

  const criticalProjects = ctx.projects
    .filter((p) => !['concluido', 'pausado'].includes(p.status) && (isDeadlineClose(p) || isDeadlineOverdue(p)))
    .slice(0, 10);

  const leadLines = activeLeads.map((l) => {
    const value = l.value ? `R$ ${l.value.toLocaleString('pt-BR')}` : 'sem valor';
    return `- ${l.name}${l.company ? ` (${l.company})` : ''} · ${l.status} · ${l.priority} · ${value} · último contato ${new Date(l.last_contact_at).toLocaleDateString('pt-BR')}`;
  });

  const overdueLines = overdueEvents.map((e) => {
    const lead = ctx.leads.find((l) => l.id === e.lead_id);
    return `- ${e.title} · ${lead?.name || 'sem lead'} · ${new Date(e.scheduled_at).toLocaleString('pt-BR')}`;
  });

  const todayLines = todayEvents.map((e) => {
    const lead = ctx.leads.find((l) => l.id === e.lead_id);
    return `- ${e.title} · ${lead?.name || 'sem lead'} · ${new Date(e.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  });

  const upcomingLines = upcomingEvents.map((e) => {
    const lead = ctx.leads.find((l) => l.id === e.lead_id);
    return `- ${e.title} · ${lead?.name || 'sem lead'} · ${new Date(e.scheduled_at).toLocaleString('pt-BR')}`;
  });

  const projectLines = criticalProjects.map((p) => {
    const days = p.deadline
      ? Math.ceil((new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return `- ${p.lead?.name || 'sem lead'} · ${p.status}${days !== null ? ` · deadline ${days}d` : ''}`;
  });

  return [
    `Você é o Nexo Operador, um agente AI do CRM NEXO's Eye.`,
    `Agora: ${now}.`,
    `Usuário: ${ctx.userEmail || 'desconhecido'}.`,
    '',
    `=== LEADS ATIVOS (${ctx.activeLeads.length} total, mostrando ${activeLeads.length}) ===`,
    leadLines.join('\n') || 'Nenhum lead ativo.',
    '',
    `=== EVENTOS ATRASADOS (${overdueEvents.length}) ===`,
    overdueLines.join('\n') || 'Nenhum evento atrasado.',
    '',
    `=== EVENTOS HOJE (${todayEvents.length}) ===`,
    todayLines.join('\n') || 'Nenhum evento hoje.',
    '',
    `=== PRÓXIMOS EVENTOS (${upcomingEvents.length}) ===`,
    upcomingLines.join('\n') || 'Nenhum próximo evento.',
    '',
    `=== PROJETOS CRÍTICOS (${criticalProjects.length}) ===`,
    projectLines.join('\n') || 'Nenhum projeto crítico.',
    '',
    `=== REGRAS ===`,
    `- Sempre confirme fatos com os dados acima antes de agir.`,
    `- Se for executar uma ação, use a ferramenta correspondente.`,
    `- Se o modo automático estiver desligado, peça confirmação antes de executar.`,
    `- Seja direto, objetivo e útil.`,
  ].join('\n');
}
