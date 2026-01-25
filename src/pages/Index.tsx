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
import { useLeads } from '@/hooks/useLeads';
import { Lead, KANBAN_COLUMNS } from '@/types/lead';
import { Users, TrendingUp, Bell, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [activePage, setActivePage] = useState('pipeline');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const {
    leads,
    loading,
    isConnected,
    updateLeadStatus,
    updateLead,
    updateLastContact,
    archiveLead,
    unarchiveLead,
    permanentlyDeleteLead,
    analyzeLeadWithAI,
    createLead,
    processStaleLeads,
  } = useLeads();

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

  // Group leads by status
  const leadsByStatus = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    KANBAN_COLUMNS.forEach((col) => {
      grouped[col.id] = activeLeads.filter((lead) => lead.status === col.id);
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

  const handleDrop = (leadId: string, newStatus: Lead['status']) => {
    updateLeadStatus(leadId, newStatus);
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

  return (
    <div className="flex min-h-screen bg-background grid-pattern">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/10 px-4 md:px-6 flex items-center justify-between glass-card boot-fade-in">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground">
              {activePage === 'pipeline' && 'Pipeline de Vendas'}
              {activePage === 'dashboard' && 'Visão Geral'}
              {activePage === 'analytics' && 'Analytics'}
              {activePage === 'settings' && 'Configurações'}
              {activePage === 'help' && 'Central de Ajuda'}
            </h2>
            <p className="text-xs text-muted-foreground font-mono hidden md:block">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {activePage === 'pipeline' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleProcessStale}
                className="border-white/10 hover:bg-white/5 hidden md:flex"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Processar Inativos
              </Button>
            )}
            <ArchivedLeadsSheet
              archivedLeads={archivedLeads}
              onUnarchive={unarchiveLead}
              onPermanentDelete={permanentlyDeleteLead}
            />
            <SystemStatus isConnected={isConnected} />
            <AddLeadModal onAdd={createLead} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && <DashboardView leads={activeLeads} />}
              
              {activePage === 'pipeline' && (
                <>
                  {/* Metrics Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <MetricCard
                      title="Total no Pipeline"
                      value={metrics.totalLeads}
                      subtitle="leads ativos"
                      icon={Users}
                      iconColor="text-neon-cyan"
                      delay={100}
                    />
                    <MetricCard
                      title="Taxa de Conversão"
                      value={`${metrics.conversionRate}%`}
                      subtitle="leads fechados"
                      icon={TrendingUp}
                      iconColor="text-neon-purple"
                      delay={200}
                    />
                    <MetricCard
                      title="Próxima Ação"
                      value={metrics.latestLead?.name || '—'}
                      subtitle={metrics.latestLead?.company || 'Nenhum lead pendente'}
                      icon={Bell}
                      iconColor="text-neon-green"
                      delay={300}
                    />
                  </div>

                  {/* Kanban Board */}
                  <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
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
                        delay={400 + index * 100}
                      />
                    ))}
                  </div>
                </>
              )}

              {activePage === 'analytics' && <AnalyticsView leads={activeLeads} />}
              
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
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        lead={selectedLead}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default Index;
