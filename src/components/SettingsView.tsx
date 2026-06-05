import { Settings, Bell, Palette, Database, Shield, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SettingsView() {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Notificações */}
      <div className="glass-card p-6 rounded-lg border border-marroc-dourado/15 boot-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-marroc-esmeralda" />
          <h3 className="text-lg font-semibold text-marroc-texto">Notificações</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-new" className="text-marroc-texto">Novos Leads</Label>
              <p className="text-sm text-marroc-salvia/70">Receber alerta quando um novo lead entrar</p>
            </div>
            <Switch id="notify-new" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-move" className="text-marroc-texto">Movimentação</Label>
              <p className="text-sm text-marroc-salvia/70">Notificar quando leads mudarem de etapa</p>
            </div>
            <Switch id="notify-move" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-sound" className="text-marroc-texto">Sons</Label>
              <p className="text-sm text-marroc-salvia/70">Reproduzir som nas notificações</p>
            </div>
            <Switch id="notify-sound" />
          </div>
        </div>
      </div>

      {/* Aparência */}
      <div className="glass-card p-6 rounded-lg border border-marroc-dourado/15 boot-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-marroc-dourado" />
          <h3 className="text-lg font-semibold text-marroc-texto">Aparência</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="animations" className="text-marroc-texto">Animações</Label>
              <p className="text-sm text-marroc-salvia/70">Habilitar animações de transição</p>
            </div>
            <Switch id="animations" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="grid-bg" className="text-marroc-texto">Grid de Fundo</Label>
              <p className="text-sm text-marroc-salvia/70">Mostrar padrão de grid no fundo</p>
            </div>
            <Switch id="grid-bg" defaultChecked />
          </div>
        </div>
      </div>

      {/* Integrações */}
      <div className="glass-card p-6 rounded-lg border border-marroc-dourado/15 boot-fade-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <Zap className="w-5 h-5 text-marroc-salvia" />
          <h3 className="text-lg font-semibold text-marroc-texto">Integrações</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-marroc-dourado/5">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-marroc-esmeralda" />
              <div>
                <p className="text-marroc-texto font-medium">Lovable Cloud</p>
                <p className="text-sm text-marroc-salvia/70">Banco de dados conectado</p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs font-mono rounded bg-marroc-salvia/20 text-marroc-salvia border border-neon-green/30">
              ONLINE
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-marroc-dourado/5">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-marroc-dourado" />
              <div>
                <p className="text-marroc-texto font-medium">Webhook n8n</p>
                <p className="text-sm text-marroc-salvia/70">Automações configuradas</p>
              </div>
            </div>
            <span className="px-2 py-1 text-xs font-mono rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              PENDENTE
            </span>
          </div>
        </div>
      </div>

      {/* Sistema */}
      <div className="glass-card p-6 rounded-lg border border-marroc-dourado/15 boot-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-5 h-5 text-marroc-salvia/70" />
          <h3 className="text-lg font-semibold text-marroc-texto">Sistema</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-marroc-salvia/70">Versão</span>
            <span className="font-mono text-marroc-texto">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-marroc-salvia/70">Última atualização</span>
            <span className="font-mono text-marroc-texto">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
