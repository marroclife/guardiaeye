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
  iconColor = 'text-neon-cyan',
  delay = 0 
}: MetricCardProps) {
  return (
    <div 
      className="glass-card p-6 relative overflow-hidden group boot-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
      
      {/* Icon glow */}
      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <Icon className={`w-16 h-16 ${iconColor}`} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-5 h-5 ${iconColor}`} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
        </div>
        
        <div className="font-mono text-3xl font-bold text-foreground mb-1">
          {value}
        </div>
        
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${iconColor === 'text-neon-purple' ? 'from-neon-purple/5' : iconColor === 'text-neon-green' ? 'from-neon-green/5' : 'from-neon-cyan/5'} to-transparent`} />
      </div>
    </div>
  );
}
