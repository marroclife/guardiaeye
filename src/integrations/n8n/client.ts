import { toast } from 'sonner';

export interface N8NConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface TriggerWorkflowOptions {
  workflowName: string;
  payload?: Record<string, unknown>;
}

export function createN8NClient(config: N8NConfig) {
  const baseUrl = config.baseUrl.replace(/\/$/, '');

  async function triggerWorkflow({ workflowName, payload }: TriggerWorkflowOptions): Promise<unknown> {
    try {
      const response = await fetch(`${baseUrl}/${workflowName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify(payload || {}),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`N8N HTTP ${response.status}: ${text}`);
      }

      const data = await response.json();
      toast.success(`Workflow ${workflowName} disparado`);
      return data;
    } catch (error) {
      console.error('Error triggering N8N workflow:', error);
      toast.error(`Erro no workflow ${workflowName}`);
      throw error;
    }
  }

  return {
    triggerWorkflow,
  };
}
