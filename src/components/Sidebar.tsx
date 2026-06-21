import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Activity,
  Shield,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LogOut,
  Eye,
  Menu,
  DollarSign,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pipeline', label: 'Pipeline', icon: Users },
  { id: 'projects', label: 'Projetos', icon: Shield },
  { id: 'finance', label: 'Financeiro', icon: DollarSign },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'settings', label: 'Configurações', icon: Settings },
  { id: 'help', label: 'Ajuda', icon: HelpCircle },
];

export function Sidebar({ activePage, onPageChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erro ao sair');
    } else {
      toast.success('Você saiu do sistema');
    }
  };

  const renderMenu = () => (
    <>
      {menuItems.map((item, index) => {
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              onPageChange(item.id);
              setMobileOpen(false);
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-lg
              transition-all duration-200 group boot-fade-in
              ${isActive 
                ? 'bg-marroc-esmeralda/10 text-marroc-esmeralda border border-marroc-esmeralda/30' 
                : 'text-marroc-salvia/70 hover:text-marroc-texto hover:bg-marroc-dourado/5'
              }
            `}
            style={{ animationDelay: `${(index + 1) * 100}ms` }}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-marroc-esmeralda' : ''}`} />
            <span className="text-sm font-medium">{item.label}</span>
            {isActive && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-marroc-esmeralda" />
            )}
          </button>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 glass-card border-b border-marroc-dourado/15 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-marroc-esmeralda/15 border border-marroc-esmeralda/40 flex items-center justify-center">
            <Eye className="w-4 h-4 text-marroc-esmeralda" />
          </div>
          <h1 className="font-display font-semibold text-marroc-dourado text-base">NEXO's Eye</h1>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-marroc-salvia hover:bg-marroc-dourado/5"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <aside 
        className={`
          h-screen glass-card border-r border-marroc-dourado/15
          flex flex-col transition-all duration-300 ease-out
          ${collapsed ? 'w-16' : 'w-64'}
          hidden md:flex
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-marroc-dourado/15 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-marroc-esmeralda/15 border border-marroc-esmeralda/40 flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-marroc-esmeralda" />
          </div>
          {!collapsed && (
            <div className="boot-fade-in">
              <h1 className="font-display font-semibold text-marroc-dourado text-lg leading-tight">NEXO's Eye</h1>
              <p className="text-[10px] text-marroc-salvia/70 font-mono tracking-wider">
                CRM · v1
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {renderMenu()}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-marroc-dourado/15 space-y-2">
          {user && !collapsed && (
            <div className="px-3 py-2 text-xs text-marroc-salvia/70 truncate">
              {user.email}
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                       text-marroc-salvia/70 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {!collapsed && <span className="text-sm">Sair</span>}
          </button>
        </div>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-marroc-dourado/15">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       text-marroc-salvia/70 hover:text-marroc-texto hover:bg-marroc-dourado/5 transition-colors"
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

      {/* Mobile drawer */}
      <div
        className={`
          md:hidden fixed top-14 left-0 right-0 glass-card border-b border-marroc-dourado/15 z-40
          transition-all duration-300 overflow-hidden
          ${mobileOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <nav className="p-3 space-y-1">
          {renderMenu()}
        </nav>
        <div className="p-3 border-t border-marroc-dourado/15">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-marroc-salvia/70 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sair</span>
          </button>
        </div>
      </div>
    </>
  );
}
