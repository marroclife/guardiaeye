import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = 'text-marroc-esmeralda',
  delay = 0 
}: MetricCardProps) {
  return (
    <div 
      className="glass-card p-6 relative overflow-hidden group boot-fade-in hover:border-marroc-dourado/30 transition-colors"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Linha de acento dourada no topo */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-marroc-dourado/40 to-transparent" />
      
      {/* Ícone decorativo de fundo - bem mais sutil agora */}
      <div className="absolute -top-2 -right-2 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700">
        <Icon className={`w-28 h-28 ${iconColor}`} strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-marroc-dourado/8 border border-marroc-dourado/20 flex items-center justify-center">
            <Icon className={`w-4 h-4 ${iconColor}`} strokeWidth={2} />
          </div>
          <span className="text-xs font-medium text-marroc-salvia/70 uppercase tracking-widest">
            {title}
          </span>
        </div>
        
        <div className="font-display text-4xl font-bold text-marroc-dourado mb-2 leading-none">
          {value}
        </div>
        
        {subtitle && (
          <p className="text-sm text-marroc-salvia/70 font-light">{subtitle}</p>
        )}
      </div>

      {/* Hover glow sutil em esmeralda (operador) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-marroc-esmeralda/[0.03] to-transparent" />
      </div>
    </div>
  );
}
