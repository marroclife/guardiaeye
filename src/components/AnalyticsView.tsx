import { Lead, KANBAN_COLUMNS } from '@/types/lead';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  leads: Lead[];
}

export function AnalyticsView({ leads }: AnalyticsViewProps) {
  const totalLeads = leads.length;
  const closedLeads = leads.filter((l) => l.status === 'fechado').length;
  const conversionRate = totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;
  const totalValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const avgValue = totalLeads > 0 ? Math.round(totalValue / totalLeads) : 0;

  // Generate status distribution from KANBAN_COLUMNS
  const statusDistribution = KANBAN_COLUMNS.map((col, index) => ({
    status: col.title,
    count: leads.filter(l => l.status === col.id).length,
    color: index === 0 ? 'bg-marroc-esmeralda' : 
           index === 1 ? 'bg-blue-500' :
           index === 2 ? 'bg-orange-500' :
           index === 3 ? 'bg-yellow-500' :
           index === 4 ? 'bg-purple-500' : 'bg-marroc-salvia',
  }));

  const priorityDistribution = [
    { priority: 'Alta', count: leads.filter(l => l.priority === 'high').length, color: 'text-red-300' },
    { priority: 'Média', count: leads.filter(l => l.priority === 'medium').length, color: 'text-yellow-400' },
    { priority: 'Baixa', count: leads.filter(l => l.priority === 'low').length, color: 'text-marroc-salvia' },
  ];

  // Calculate value by status
  const valueByStatus = KANBAN_COLUMNS.map(col => ({
    status: col.title,
    value: leads.filter(l => l.status === col.id).reduce((acc, l) => acc + (l.value || 0), 0),
  })).filter(v => v.value > 0);

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Leads', value: totalLeads, icon: BarChart3 },
          { label: 'Taxa de Conversão', value: `${conversionRate}%`, icon: TrendingUp },
          { label: 'Valor Total', value: `R$ ${totalValue.toLocaleString('pt-BR')}`, icon: PieChart },
          { label: 'Ticket Médio', value: `R$ ${avgValue.toLocaleString('pt-BR')}`, icon: Calendar },
        ].map((kpi, index) => (
          <div
            key={kpi.label}
            className="glass-card p-5 rounded-lg border border-marroc-dourado/15 boot-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <kpi.icon className="w-5 h-5 text-marroc-esmeralda" />
              <span className="text-sm text-marroc-salvia/70">{kpi.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-marroc-dourado">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Distribuição por Status */}
      <div className="glass-card p-6 rounded-lg border border-marroc-dourado/15 boot-fade-in" style={{ animationDelay: '200ms' }}>
        <h3 className="text-lg font-semibold text-marroc-texto mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-marroc-dourado" />
          Distribuição por Status
        </h3>
        <div className="space-y-4">
          {statusDistribution.map((item, index) => {
            const percentage = totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0;
            return (
              <div key={item.status} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-marroc-salvia/70">{item.status}</span>
                  <span className="font-display text-marroc-dourado">{item.count} ({percentage}%)</span>
                </div>
                <div className="h-2 bg-marroc-dourado/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${percentage}%`,
                      animationDelay: `${300 + index * 100}ms`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Valor por Etapa */}
      {valueByStatus.length > 0 && (
        <div className="glass-card p-6 rounded-lg border border-marroc-dourado/15 boot-fade-in" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-marroc-texto mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-marroc-salvia" />
            Valor por Etapa
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {valueByStatus.map((item) => (
              <div key={item.status} className="text-center p-4 rounded-lg bg-marroc-dourado/5">
                <p className="text-xl font-display font-bold text-marroc-salvia">
                  R$ {item.value.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-marroc-salvia/70 mt-1">{item.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distribuição por Prioridade */}
      <div className="glass-card p-6 rounded-lg border border-marroc-dourado/15 boot-fade-in" style={{ animationDelay: '400ms' }}>
        <h3 className="text-lg font-semibold text-marroc-texto mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-marroc-esmeralda" />
          Distribuição por Temperatura
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {priorityDistribution.map((item) => (
            <div key={item.priority} className="text-center p-4 rounded-lg bg-marroc-dourado/5">
              <p className={`text-3xl font-display font-bold ${item.color}`}>{item.count}</p>
              <p className="text-sm text-marroc-salvia/70 mt-1">{item.priority}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
