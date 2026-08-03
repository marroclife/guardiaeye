import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SystemStatus } from '@/components/SystemStatus';
import { MetricCard } from '@/components/MetricCard';
import { KanbanColumn } from '@/components/KanbanColumn';
import { LeadDetailSheet } from '@/components/LeadDetailSheet';
import { AddLeadModal } from '@/components/AddLeadModal';
import { EditLeadModal } from '@/components/EditLeadModal';
import { ArchivedLeadsSheet } from '@/components/ArchivedLeadsSheet';
import { DashboardView } from '@/components/DashboardView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { SettingsView } from '@/components/SettingsView';
import { HelpView } from '@/components/HelpView';
import { ProjectsView } from '@/components/ProjectsView';
import { FinanceView } from '@/components/FinanceView';
import { CalendarView } from '@/components/CalendarView';
import { AddProjectModal } from '@/components/AddProjectModal';
import { LeadEventModal } from '@/components/AddLeadEventModal';
import { AIChat } from '@/components/AIChat';
import { AISettingsPanel } from '@/components/AISettings';
import { useLeads } from '@/hooks/useLeads';
import { useProjects } from '@/hooks/useProjects';
import { useLeadEvents } from '@/hooks/useLeadEvents';
import { useAuth } from '@/hooks/useAuth';
import { useAISettings } from '@/hooks/useAISettings';
import { useAgent } from '@/ai/useAgent';
import { createN8NClient } from '@/integrations/n8n/client';
import { Lead, KANBAN_COLUMNS } from '@/types/lead';
import { Users, TrendingUp, Bell, Loader2, RefreshCw, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOBILE_COLUMN_PAIRS: [string, string][] = [
  ['triagem', 'em_contato'],
  ['sem_resposta', 'em_espera'],
  ['proposta', 'fechado'],
];

const Index = () => {
  const [activePage, setActivePage] = useState('pipeline');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectInitialLeadId, setProjectInitialLeadId] = useState<string | undefined>(undefined);

  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventInitialLeadId, setEventInitialLeadId] = useState<string | undefined>(undefined);
  const [eventInitialDate, setEventInitialDate] = useState<Date | undefined>(undefined);
  const [eventToEdit, setEventToEdit] = useState<LeadEvent | null>(null);

  const [aiChatOpen, setAiChatOpen] = useState(false);
  const { user } = useAuth();
  const { settings, updateSettings, resetSettings } = useAISettings();

  const n8nClient = useMemo(() => createN8NClient({
    baseUrl: settings.n8nWebhookUrl,
    apiKey: settings.n8nApiKey,
  }), [settings.n8nWebhookUrl, settings.n8nApiKey]);

  const {
    leads,
    loading: leadsLoading,
    isConnected: leadsConnected,
    updateLeadStatus,
    updateLead,
    updateLastContact,
    archiveLead,
    unarchiveLead,
    permanentlyDeleteLead,
    analyzeLeadWithAI,
    createLead,
    processStaleLeads,
    reorderLeads,
  } = useLeads();

  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompleted,
  } = useLeadEvents();

  const {
    projects,
    createProject,
    getClosedLeadsWithoutProject,
  } = useProjects();

  const agent = useAgent({
    settings,
    leads,
    events,
    projects: projects.map((p) => ({
      ...p,
      lead_id: p.lead_id,
      user_id: p.user_id,
      contract_number: p.contract_number,
      start_date: p.start_date,
      deadline: p.deadline,
      features: p.features,
      status: p.status,
      notes: p.notes,
      position: p.position,
    })),
    userEmail: user?.email || null,
    createLead,
    updateLead,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompleted,
    moveLeadStatus: updateLeadStatus,
    createProject,
    triggerN8N: n8nClient.triggerWorkflow,
  });

  // Process stale leads on mount and periodically
  useEffect(() => {
    const timer = setTimeout(() => {
      processStaleLeads();
    }, 2000);

    return () => clearTimeout(timer);
  }, [processStaleLeads]);

  // Separate active and archived leads
  const activeLeads = useMemo(() => leads.filter(l => !l.archived), [leads]);
  const archivedLeads = useMemo(() => leads.filter(l => l.archived), [leads]);

  // Track which leads already have projects
  const leadIdsWithProject = useMemo(() => {
    return new Set(projects.map((p) => p.lead_id));
  }, [projects]);

  // Group leads by status, sorted by position
  const leadsByStatus = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    KANBAN_COLUMNS.forEach((col) => {
      grouped[col.id] = activeLeads
        .filter((lead) => lead.status === col.id)
        .sort((a, b) => a.position - b.position);
    });
    return grouped;
  }, [activeLeads]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalLeads = activeLeads.length;
    const closedLeads = activeLeads.filter((l) => l.status === 'fechado').length;
    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
    const latestLead = activeLeads[0];
    
    return {
      totalLeads,
      conversionRate,
      latestLead,
    };
  }, [activeLeads]);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  };

  const handleDrop = (leadId: string, newStatus: Lead['status'], newPosition?: number) => {
    updateLeadStatus(leadId, newStatus, newPosition);

    // If lead moved to "fechado", offer to create a project
    if (newStatus === 'fechado') {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && !leadIdsWithProject.has(lead.id)) {
        setProjectInitialLeadId(lead.id);
        setProjectModalOpen(true);
      }
    }
  };

  const handleCreateProjectFromLead = (lead: Lead) => {
    if (!leadIdsWithProject.has(lead.id)) {
      setProjectInitialLeadId(lead.id);
      setProjectModalOpen(true);
    }
  };

  const handleReorder = (reorderedLeads: { id: string; position: number }[]) => {
    reorderLeads(reorderedLeads);
  };

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (leadId: string, updates: Partial<Lead>) => {
    await updateLead(leadId, updates);
  };

  const handleProcessStale = async () => {
    await processStaleLeads();
  };

  const renderKanbanColumn = (columnId: string, index: number, isMobilePair = false) => {
    const column = KANBAN_COLUMNS.find((c) => c.id === columnId);
    if (!column) return null;
    return (
      <KanbanColumn
        key={column.id}
        id={column.id}
        title={column.title}
        icon={column.icon}
        color={column.color}
        leads={leadsByStatus[column.id] || []}
        onLeadClick={handleLeadClick}
        onDrop={handleDrop}
        onReorder={handleReorder}
        delay={400 + index * 100}
        compact={isMobilePair}
      />
    );
  };

  const loading = leadsLoading;
  const isConnected = leadsConnected;

  return (
    <div className="flex min-h-screen bg-marroc-muscgo grid-pattern pt-14 md:pt-0">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 md:h-16 border-b border-marroc-dourado/15 px-4 md:px-6 flex items-center justify-between glass-card boot-fade-in">
          <div>
            <h2 className="text-sm md:text-lg font-display font-semibold text-marroc-dourado">
              {activePage === 'dashboard' && 'Visão Geral'}
              {activePage === 'pipeline' && 'Pipeline de Vendas'}
              {activePage === 'calendar' && 'Calendário de Leads'}
              {activePage === 'projects' && 'Projetos'}
              {activePage === 'analytics' && 'Analytics'}
              {activePage === 'settings' && 'Configurações'}
              {activePage === 'finance' && 'Financeiro'}
              {activePage === 'ai-settings' && 'Operador AI'}
            </h2>
            <p className="text-xs text-marroc-salvia/70 font-mono hidden md:block">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {(activePage === 'pipeline' || activePage === 'calendar') && (
              <>
                {activePage === 'pipeline' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleProcessStale}
                    className="border-marroc-dourado/25 text-marroc-dourado hover:bg-marroc-dourado/10 hover:text-marroc-dourado hidden md:flex"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Processar Inativos
                  </Button>
                )}
                {activePage === 'calendar' && (
                  <Button
                    size="sm"
                    className="btn-marroc"
                    onClick={() => {
                      setEventInitialDate(new Date());
                      setEventInitialLeadId(undefined);
                      setEventModalOpen(true);
                    }}
                  >
                    + Agendar
                  </Button>
                )}
                {activePage === 'pipeline' && <AddLeadModal onAdd={createLead} />}
              </>
            )}
            {activePage === 'ai-settings' && (
              <Button
                size="sm"
                className="btn-marroc"
                onClick={() => setAiChatOpen(true)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Abrir Chat
              </Button>
            )}
            <ArchivedLeadsSheet
              archivedLeads={archivedLeads}
              onUnarchive={unarchiveLead}
              onPermanentDelete={permanentlyDeleteLead}
            />
            <SystemStatus isConnected={isConnected} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-marroc-esmeralda" />
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && <DashboardView leads={activeLeads} />}
              
              {activePage === 'pipeline' && (
                <>
                  {/* Metrics Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                    <MetricCard
                      title="Total no Pipeline"
                      value={metrics.totalLeads}
                      subtitle="leads ativos"
                      icon={Users}
                      iconColor="text-marroc-esmeralda"
                      delay={100}
                    />
                    <MetricCard
                      title="Taxa de Conversão"
                      value={`${metrics.conversionRate}%`}
                      subtitle="leads fechados"
                      icon={TrendingUp}
                      iconColor="text-marroc-dourado"
                      delay={200}
                    />
                    <MetricCard
                      title="Próxima Ação"
                      value={metrics.latestLead?.name || '—'}
                      subtitle={metrics.latestLead?.company || 'Nenhum lead pendente'}
                      icon={Bell}
                      iconColor="text-marroc-salvia"
                      delay={300}
                    />
                  </div>

                  {/* Desktop Kanban Board */}
                  <div className="hidden md:flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-3 px-3 md:mx-0 md:px-0">
                    {KANBAN_COLUMNS.map((column, index) => (
                      <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        icon={column.icon}
                        color={column.color}
                        leads={leadsByStatus[column.id] || []}
                        onLeadClick={handleLeadClick}
                        onDrop={handleDrop}
                        onReorder={handleReorder}
                        delay={400 + index * 100}
                      />
                    ))}
                  </div>

                  {/* Mobile Kanban Grid — 2 columns per row */}
                  <div className="md:hidden space-y-4">
                    {MOBILE_COLUMN_PAIRS.map((pair, pairIndex) => (
                      <div key={pairIndex} className="grid grid-cols-2 gap-3">
                        {pair.map((colId, colIndex) =>
                          renderKanbanColumn(colId, pairIndex * 2 + colIndex, true)
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activePage === 'calendar' && (
                <CalendarView
                  leads={activeLeads}
                  events={events}
                  onAddEvent={(date, leadId) => {
                    setEventInitialDate(date);
                    setEventInitialLeadId(leadId);
                    setEventModalOpen(true);
                  }}
                  onToggleComplete={toggleEventCompleted}
                  onDeleteEvent={deleteEvent}
                  onLeadClick={(lead) => {
                    setSelectedLead(lead);
                    setSheetOpen(true);
                  }}
                />
              )}

              {activePage === 'projects' && <ProjectsView />}

              {activePage === 'finance' && <FinanceView />}

              {activePage === 'analytics' && <AnalyticsView leads={activeLeads} />}
              
              {activePage === 'ai-settings' && (
                <AISettingsPanel
                  settings={settings}
                  onUpdate={updateSettings}
                  onReset={resetSettings}
                />
              )}

              {activePage === 'settings' && <SettingsView />}

              {activePage === 'help' && <HelpView />}
            </>
          )}
        </div>
      </main>

      {/* Lead Detail Sheet */}
      <LeadDetailSheet
        lead={selectedLead}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onArchive={archiveLead}
        onUpdate={updateLead}
        onEdit={handleEditLead}
        onAnalyze={analyzeLeadWithAI}
        onUpdateLastContact={updateLastContact}
        onCreateProject={handleCreateProjectFromLead}
        onAddEvent={(lead) => {
          setEventInitialLeadId(lead.id);
          setEventInitialDate(new Date());
          setEventModalOpen(true);
        }}
        onToggleEventComplete={toggleEventCompleted}
        onDeleteEvent={deleteEvent}
        leadEvents={events}
        hasProject={selectedLead ? leadIdsWithProject.has(selectedLead.id) : false}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        lead={selectedLead}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveEdit}
      />

      {/* Add Project Modal — controlled from pipeline actions, no trigger in header */}
      <AddProjectModal
        onAdd={createProject}
        getClosedLeads={getClosedLeadsWithoutProject}
        initialLeadId={projectInitialLeadId}
        open={projectModalOpen}
        onOpenChange={(open) => {
          setProjectModalOpen(open);
          if (!open) setProjectInitialLeadId(undefined);
        }}
        trigger={null}
      />

      {/* AI Chat Modal — available globally */}
      {aiChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md h-[70vh] md:h-[600px] animate-in slide-in-from-bottom-4 fade-in duration-300">
            <AIChat
              messages={agent.messages}
              loading={agent.loading}
              pendingToolCalls={agent.pendingToolCalls}
              onSend={agent.sendMessage}
              onApprove={agent.approvePendingTools}
              onReject={agent.rejectPendingTools}
              onClose={() => setAiChatOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Floating AI Button — available on all pages */}
      <button
        onClick={() => setAiChatOpen(true)}
        className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
          aiChatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        } bg-marroc-esmeralda/20 border border-marroc-esmeralda/40 text-marroc-esmeralda hover:bg-marroc-esmeralda/30 hover:border-marroc-esmeralda/60`}
        aria-label="Abrir Nexo Operador"
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Nexo Operador</span>
      </button>

      {/* Add Lead Event Modal */}
      <LeadEventModal
        leads={activeLeads}
        initialLeadId={eventInitialLeadId}
        initialDate={eventInitialDate}
        eventToEdit={eventToEdit}
        open={eventModalOpen}
        onOpenChange={(open) => {
          setEventModalOpen(open);
          if (!open) {
            setEventInitialLeadId(undefined);
            setEventInitialDate(undefined);
            setEventToEdit(null);
          }
        }}
        onAdd={createEvent}
        onUpdate={updateEvent}
      />
    </div>
  );
};

export default Index;
