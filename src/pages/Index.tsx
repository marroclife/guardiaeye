import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { SystemStatus } from '@/components/SystemStatus';
import { MetricCard } from '@/components/MetricCard';
import { KanbanColumn } from '@/components/KanbanColumn';
import { LeadDetailSheet } from '@/components/LeadDetailSheet';
import { AddLeadModal } from '@/components/AddLeadModal';
import { DashboardView } from '@/components/DashboardView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { SettingsView } from '@/components/SettingsView';
import { useLeads } from '@/hooks/useLeads';
import { Lead, KANBAN_COLUMNS } from '@/types/lead';
import { Users, TrendingUp, Bell, Loader2 } from 'lucide-react';

const Index = () => {
  const [activePage, setActivePage] = useState('pipeline');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    leads,
    loading,
    isConnected,
    updateLeadStatus,
    updateLead,
    deleteLead,
    createLead,
  } = useLeads();

  // Group leads by status
  const leadsByStatus = useMemo(() => {
    const grouped: Record<string, Lead[]> = {};
    KANBAN_COLUMNS.forEach((col) => {
      grouped[col.id] = leads.filter((lead) => lead.status === col.id);
    });
    return grouped;
  }, [leads]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const closedLeads = leads.filter((l) => l.status === 'fechado').length;
    const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
    const latestLead = leads[0];
    
    return {
      totalLeads,
      conversionRate,
      latestLead,
    };
  }, [leads]);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setSheetOpen(true);
  };

  const handleDrop = (leadId: string, newStatus: Lead['status']) => {
    updateLeadStatus(leadId, newStatus);
  };

  return (
    <div className="flex min-h-screen bg-background grid-pattern">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between glass-card boot-fade-in">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {activePage === 'pipeline' && 'Pipeline de Vendas'}
              {activePage === 'dashboard' && 'Visão Geral'}
              {activePage === 'analytics' && 'Analytics'}
              {activePage === 'settings' && 'Configurações'}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SystemStatus isConnected={isConnected} />
            <AddLeadModal onAdd={createLead} />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && <DashboardView leads={leads} />}
              
              {activePage === 'pipeline' && (
                <>
                  {/* Metrics Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {KANBAN_COLUMNS.map((column, index) => (
                      <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        icon={column.icon}
                        leads={leadsByStatus[column.id] || []}
                        onLeadClick={handleLeadClick}
                        onDrop={handleDrop}
                        delay={400 + index * 100}
                      />
                    ))}
                  </div>
                </>
              )}

              {activePage === 'analytics' && <AnalyticsView leads={leads} />}
              
              {activePage === 'settings' && <SettingsView />}
            </>
          )}
        </div>
      </main>

      {/* Lead Detail Sheet */}
      <LeadDetailSheet
        lead={selectedLead}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDelete={deleteLead}
        onUpdate={updateLead}
      />
    </div>
  );
};

export default Index;
