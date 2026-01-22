import { MetricCard } from './MetricCard';
import { Lead } from '@/types/lead';
import { Users, TrendingUp, Bell, DollarSign, Target, Clock } from 'lucide-react';

interface DashboardViewProps {
  leads: Lead[];
}

export function DashboardView({ leads }: DashboardViewProps) {
  const totalLeads = leads.length;
  const closedLeads = leads.filter((l) => l.status === 'fechado').length;
  const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
  const totalValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const qualifiedLeads = leads.filter((l) => l.status === 'qualificado').length;
  const inProposal = leads.filter((l) => l.status === 'proposta').length;
  const latestLead = leads[0];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 boot-fade-in">
          Métricas Principais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Total no Pipeline"
            value={totalLeads}
            subtitle="leads ativos"
            icon={Users}
            iconColor="text-neon-cyan"
            delay={100}
          />
          <MetricCard
            title="Taxa de Conversão"
            value={`${conversionRate}%`}
            subtitle="leads fechados"
            icon={TrendingUp}
            iconColor="text-neon-purple"
            delay={200}
          />
          <MetricCard
            title="Valor Total"
            value={`R$ ${totalValue.toLocaleString('pt-BR')}`}
            subtitle="em negociação"
            icon={DollarSign}
            iconColor="text-neon-green"
            delay={300}
          />
          <MetricCard
            title="Qualificados"
            value={qualifiedLeads}
            subtitle="prontos para proposta"
            icon={Target}
            iconColor="text-neon-cyan"
            delay={400}
          />
          <MetricCard
            title="Em Proposta"
            value={inProposal}
            subtitle="aguardando resposta"
            icon={Clock}
            iconColor="text-neon-purple"
            delay={500}
          />
          <MetricCard
            title="Próxima Ação"
            value={latestLead?.name || '—'}
            subtitle={latestLead?.company || 'Nenhum lead pendente'}
            icon={Bell}
            iconColor="text-neon-green"
            delay={600}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 boot-fade-in" style={{ animationDelay: '300ms' }}>
          Resumo do Pipeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Triagem', count: leads.filter(l => l.status === 'triagem').length, color: 'bg-neon-cyan/20 border-neon-cyan/30' },
            { label: 'Qualificados', count: qualifiedLeads, color: 'bg-neon-purple/20 border-neon-purple/30' },
            { label: 'Em Proposta', count: inProposal, color: 'bg-yellow-500/20 border-yellow-500/30' },
            { label: 'Fechados', count: closedLeads, color: 'bg-neon-green/20 border-neon-green/30' },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`glass-card p-4 rounded-lg border ${item.color} boot-fade-in`}
              style={{ animationDelay: `${400 + index * 100}ms` }}
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-3xl font-bold font-mono text-foreground mt-1">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
