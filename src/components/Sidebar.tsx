import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'help', label: 'Ajuda', icon: HelpCircle },
];

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={`
        h-screen glass-card border-r border-white/10 
        flex flex-col transition-all duration-300 ease-out
        ${collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-black" />
        </div>
        {!collapsed && (
          <div className="boot-fade-in">
            <h1 className="font-semibold text-foreground">Guardian's Eye</h1>
            <p className="text-[10px] text-muted-foreground font-mono tracking-wider">
              CRM SYSTEM v1.0
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                transition-all duration-200 group boot-fade-in
                ${isActive 
                  ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }
              `}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-neon-cyan' : ''}`} />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-cyan" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                     text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Recolher</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
