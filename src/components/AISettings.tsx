import { AISettings, AIProvider, DEFAULT_AI_SETTINGS } from '@/ai/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bot, RefreshCw, Save } from 'lucide-react';

interface AISettingsProps {
  settings: AISettings;
  onUpdate: (updates: Partial<AISettings>) => void;
  onReset: () => void;
}

const PROVIDERS: { id: AIProvider; label: string }[] = [
  { id: 'ollama-cloud', label: 'Ollama Cloud (default)' },
  { id: 'ollama-local', label: 'Ollama Local' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'n8n', label: 'N8N Webhook' },
];

const MODELS_BY_PROVIDER: Record<AIProvider, string[]> = {
  'ollama-cloud': ['gemma4:31b-cloud', 'qwen2.5:14b', 'qwen2.5:32b', 'llama3.3:70b'],
  'ollama-local': ['gemma4:31b-cloud', 'qwen2.5:14b', 'llama3.2:3b', 'deepseek-r1:14b'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  n8n: ['n8n-agent'],
};

export function AISettingsPanel({ settings, onUpdate, onReset }: AISettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-marroc-esmeralda" />
          <h2 className="text-lg font-display font-semibold text-marroc-dourado">
            Configurações do Operador AI
          </h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onReset}
          className="border-marroc-dourado/15 hover:bg-marroc-dourado/5"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Resetar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-4 rounded-lg glass-card border border-marroc-dourado/10">
          <h3 className="text-sm font-medium text-marroc-texto">Modelo de IA</h3>

          <div className="space-y-2">
            <Label htmlFor="provider">Provedor</Label>
            <Select
              value={settings.provider}
              onValueChange={(value: AIProvider) => onUpdate({ provider: value, model: MODELS_BY_PROVIDER[value][0] })}
            >
              <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                {PROVIDERS.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Select
              value={settings.model}
              onValueChange={(value) => onUpdate({ model: value })}
            >
              <SelectTrigger className="bg-marroc-dourado/5 border-marroc-dourado/15">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-marroc-muscgo/95 border-marroc-dourado/15">
                {MODELS_BY_PROVIDER[settings.provider].map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4 p-4 rounded-lg glass-card border border-marroc-dourado/10">
          <h3 className="text-sm font-medium text-marroc-texto">Execução</h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="autoExecute" className="text-marroc-texto">Execução automática</Label>
              <p className="text-xs text-marroc-salvia/70">
                Quando ligado, o agente executa ferramentas sem pedir aprovação.
              </p>
            </div>
            <Switch
              id="autoExecute"
              checked={settings.autoExecute}
              onCheckedChange={(checked) => onUpdate({ autoExecute: checked })}
            />
          </div>
        </div>

        <div className="space-y-4 p-4 rounded-lg glass-card border border-marroc-dourado/10">
          <h3 className="text-sm font-medium text-marroc-texto">Endpoints</h3>

          {(settings.provider === 'ollama-cloud' || settings.provider === 'ollama-local') && (
            <div className="space-y-2">
              <Label htmlFor="ollamaUrl">URL do Ollama</Label>
              <Input
                id="ollamaUrl"
                value={settings.provider === 'ollama-cloud' ? settings.ollamaCloudUrl : settings.ollamaLocalUrl}
                onChange={(e) => onUpdate(
                  settings.provider === 'ollama-cloud'
                    ? { ollamaCloudUrl: e.target.value }
                    : { ollamaLocalUrl: e.target.value }
                )}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
              />
            </div>
          )}

          {settings.provider === 'openai' && (
            <div className="space-y-2">
              <Label htmlFor="openaiKey">OpenAI API Key</Label>
              <Input
                id="openaiKey"
                type="password"
                value={settings.openaiApiKey}
                onChange={(e) => onUpdate({ openaiApiKey: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                placeholder="sk-..."
              />
            </div>
          )}

          {settings.provider === 'anthropic' && (
            <div className="space-y-2">
              <Label htmlFor="anthropicKey">Anthropic API Key</Label>
              <Input
                id="anthropicKey"
                type="password"
                value={settings.anthropicApiKey}
                onChange={(e) => onUpdate({ anthropicApiKey: e.target.value })}
                className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                placeholder="sk-ant-..."
              />
            </div>
          )}

          {(settings.provider === 'n8n' || settings.provider === 'ollama-cloud') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="n8nUrl">N8N Webhook Base URL</Label>
                <Input
                  id="n8nUrl"
                  value={settings.n8nWebhookUrl}
                  onChange={(e) => onUpdate({ n8nWebhookUrl: e.target.value })}
                  className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                  placeholder="https://nexooperator.app.n8n.cloud/webhook/"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="n8nKey">N8N API Key (opcional)</Label>
                <Input
                  id="n8nKey"
                  type="password"
                  value={settings.n8nApiKey}
                  onChange={(e) => onUpdate({ n8nApiKey: e.target.value })}
                  className="bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
                />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4 p-4 rounded-lg glass-card border border-marroc-dourado/10">
          <h3 className="text-sm font-medium text-marroc-texto">Resumo</h3>
          <div className="text-xs text-marroc-salvia/80 space-y-1">
            <p><span className="text-marroc-dourado">Provedor:</span> {settings.provider}</p>
            <p><span className="text-marroc-dourado">Modelo:</span> {settings.model}</p>
            <p><span className="text-marroc-dourado">Auto-execução:</span> {settings.autoExecute ? 'Ativada' : 'Desativada'}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="btn-marroc" onClick={() => {}}>
          <Save className="w-4 h-4 mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
}
