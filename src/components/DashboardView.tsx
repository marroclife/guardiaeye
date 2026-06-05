import { MetricCard } from './MetricCard';
import { Lead, KANBAN_COLUMNS, isLeadStale } from '@/types/lead';
import { Users, TrendingUp, Bell, DollarSign, Target, Clock, AlertTriangle, FileText } from 'lucide-react';

interface DashboardViewProps {
  leads: Lead[];
}

export function DashboardView({ leads }: DashboardViewProps) {
  const totalLeads = leads.length;
  const closedLeads = leads.filter((l) => l.status === 'fechado').length;
  const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
  const totalValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const proposalLeads = leads.filter((l) => l.status === 'proposta').length;
  const proposalValue = leads.filter((l) => l.status === 'proposta').reduce((acc, l) => acc + (l.value || 0), 0);
  const noResponseLeads = leads.filter((l) => l.status === 'sem_resposta').length;
  const staleLeads = leads.filter(l => isLeadStale(l) && !['fechado', 'sem_resposta'].includes(l.status));
  const latestLead = leads[0];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-marroc-texto mb-4 boot-fade-in">
          Métricas Principais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Total no Pipeline"
            value={totalLeads}
            subtitle="leads ativos"
            icon={Users}
            iconColor="text-marroc-esmeralda"
            delay={100}
          />
          <MetricCard
            title="Taxa de Conversão"
            value={`${conversionRate}%`}
            subtitle="leads fechados"
            icon={TrendingUp}
            iconColor="text-marroc-dourado"
            delay={200}
          />
          <MetricCard
            title="Valor Total"
            value={`R$ ${totalValue.toLocaleString('pt-BR')}`}
            subtitle="em negociação"
            icon={DollarSign}
            iconColor="text-marroc-salvia"
            delay={300}
          />
          <MetricCard
            title="Propostas Enviadas"
            value={proposalLeads}
            subtitle={`R$ ${proposalValue.toLocaleString('pt-BR')}`}
            icon={FileText}
            iconColor="text-marroc-dourado"
            delay={400}
          />
          <MetricCard
            title="Sem Resposta"
            value={noResponseLeads}
            subtitle="aguardando retorno"
            icon={Clock}
            iconColor="text-orange-400"
            delay={500}
          />
          <MetricCard
            title="Vendas Fechadas"
            value={closedLeads}
            subtitle="protocolo ativado"
            icon={Target}
            iconColor="text-marroc-salvia"
            delay={600}
          />
        </div>
      </div>

      {/* Alertas */}
      {staleLeads.length > 0 && (
        <div className="boot-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-marroc-texto mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Leads Parados ({staleLeads.length})
          </h3>
          <div className="glass-card p-4 rounded-lg border border-orange-500/30 bg-orange-500/5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {staleLeads.slice(0, 6).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-marroc-dourado/5 rounded-lg">
                  <div>
                    <p className="font-medium text-marroc-texto text-sm truncate">{lead.name}</p>
                    <p className="text-xs text-marroc-salvia/70">{lead.company || 'Sem empresa'}</p>
                  </div>
                  <span className="text-xs text-amber-300 font-light">
                    {Math.floor((new Date().getTime() - new Date(lead.last_contact_at).getTime()) / (1000 * 60 * 60 * 24))}d
                  </span>
                </div>
              ))}
            </div>
            {staleLeads.length > 6 && (
              <p className="text-xs text-marroc-salvia/70 mt-3 text-center">
                +{staleLeads.length - 6} outros leads parados
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-marroc-texto mb-4 boot-fade-in" style={{ animationDelay: '300ms' }}>
          Resumo do Pipeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {KANBAN_COLUMNS.map((col, index) => {
            const count = leads.filter(l => l.status === col.id).length;
            const isBottleneck = count > totalLeads * 0.4 && count > 3;
            return (
              <div
                key={col.id}
                className={`glass-card p-4 rounded-lg border boot-fade-in ${
                  isBottleneck ? 'border-orange-500/50 bg-orange-500/5' : 'border-marroc-dourado/15'
                }`}
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{col.icon}</span>
                  {isBottleneck && <AlertTriangle className="w-3 h-3 text-orange-400" />}
                </div>
                <p className="text-2xl font-display font-bold text-marroc-dourado">{count}</p>
                <p className="text-xs text-marroc-salvia/70 truncate">{col.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Próxima Ação */}
      {latestLead && (
        <div className="boot-fade-in" style={{ animationDelay: '600ms' }}>
          <h3 className="text-lg font-semibold text-marroc-texto mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-marroc-esmeralda" />
            Próxima Ação Recomendada
          </h3>
          <div className="glass-card p-4 rounded-lg border border-marroc-esmeralda/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-marroc-texto">{latestLead.name}</p>
                <p className="text-sm text-marroc-salvia/70">{latestLead.company || 'Sem empresa'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-marroc-esmeralda">Follow-up pendente</p>
                <p className="text-xs text-marroc-salvia/70">
                  Último contato: {new Date(latestLead.last_contact_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
