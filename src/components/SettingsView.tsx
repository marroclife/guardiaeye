import { Settings, Bell, Palette, Database, Shield, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SettingsView() {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Notificações */}
      <div className="glass-card p-6 rounded-lg border border-white/10 boot-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-neon-cyan" />
          <h3 className="text-lg font-semibold text-foreground">Notificações</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-new" className="text-foreground">Novos Leads</Label>
              <p className="text-sm text-muted-foreground">Receber alerta quando um novo lead entrar</p>
            </div>
            <Switch id="notify-new" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-move" className="text-foreground">Movimentação</Label>
              <p className="text-sm text-muted-foreground">Notificar quando leads mudarem de etapa</p>
            </div>
            <Switch id="notify-move" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-sound" className="text-foreground">Sons</Label>
              <p className="text-sm text-muted-foreground">Reproduzir som nas notificações</p>
            </div>
            <Switch id="notify-sound" />
          </div>
        </div>
      </div>

      {/* Aparência */}
      <div className="glass-card p-6 rounded-lg border border-white/10 boot-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-neon-purple" />
          <h3 className="text-lg font-semibold text-foreground">Aparência</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations" className="text-foreground">Animações</Label>
              <p className="text-sm text-muted-foreground">Habilitar animações de transição</p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="grid-bg" className="text-foreground">Grid de Fundo</Label>
              <p className="text-sm text-muted-foreground">Mostrar padrão de grid no fundo</p>
            </div>
            <Switch id="grid-bg" defaultChecked />
          </div>
        </div>
      </div>

      {/* Integrações */}
      <div className="glass-card p-6 rounded-lg border border-white/10 boot-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-neon-green" />
          <h3 className="text-lg font-semibold text-foreground">Integrações</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-neon-cyan" />
              <div>
                <p className="text-foreground font-medium">Lovable Cloud</p>
                <p className="text-sm text-muted-foreground">Banco de dados conectado</p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs font-mono rounded bg-neon-green/20 text-neon-green border border-neon-green/30">
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-neon-purple" />
              <div>
                <p className="text-foreground font-medium">Webhook n8n</p>
                <p className="text-sm text-muted-foreground">Automações configuradas</p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs font-mono rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              PENDENTE
            </span>
          </div>
        </div>
      </div>

      {/* Sistema */}
      <div className="glass-card p-6 rounded-lg border border-white/10 boot-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Sistema</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versão</span>
            <span className="font-mono text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Última atualização</span>
            <span className="font-mono text-foreground">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
