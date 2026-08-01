import { ToolCall, ToolName, ToolResult } from './types';

export interface ToolDefinition {
  name: ToolName;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean; enum?: string[] }>;
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'createLead',
    description: 'Cria um novo lead no CRM.',
    parameters: {
      name: { type: 'string', description: 'Nome do contato', required: true },
      company: { type: 'string', description: 'Nome da empresa', required: false },
      phone: { type: 'string', description: 'WhatsApp', required: false },
      email: { type: 'string', description: 'Email', required: false },
      value: { type: 'number', description: 'Valor estimado do negócio', required: false },
      priority: { type: 'string', description: 'Temperatura do lead', enum: ['low', 'medium', 'high'], required: false },
      source: { type: 'string', description: 'Origem do lead', enum: ['whatsapp', 'instagram', 'site', 'indicacao', 'prospeccao', 'evento', 'manual'], required: false },
      obs: { type: 'string', description: 'Observações', required: false },
    },
  },
  {
    name: 'updateLead',
    description: 'Atualiza dados de um lead existente.',
    parameters: {
      leadId: { type: 'string', description: 'ID do lead', required: true },
      updates: { type: 'object', description: 'Campos a atualizar', required: true },
    },
  },
  {
    name: 'createLeadEvent',
    description: 'Agenda um evento/reunião/follow-up para um lead.',
    parameters: {
      leadId: { type: 'string', description: 'ID do lead', required: true },
      title: { type: 'string', description: 'Título do evento', required: true },
      type: { type: 'string', description: 'Tipo do evento', enum: ['reuniao', 'contato', 'proposta', 'follow_up', 'outro'], required: true },
      scheduledAt: { type: 'string', description: 'Data/hora ISO', required: true },
      durationMinutes: { type: 'number', description: 'Duração em minutos', required: false },
      notes: { type: 'string', description: 'Notas', required: false },
    },
  },
  {
    name: 'updateLeadEvent',
    description: 'Atualiza um evento existente.',
    parameters: {
      eventId: { type: 'string', description: 'ID do evento', required: true },
      updates: { type: 'object', description: 'Campos a atualizar', required: true },
    },
  },
  {
    name: 'deleteLeadEvent',
    description: 'Remove um evento.',
    parameters: {
      eventId: { type: 'string', description: 'ID do evento', required: true },
    },
  },
  {
    name: 'toggleLeadEventCompleted',
    description: 'Marca/desmarca um evento como concluído.',
    parameters: {
      eventId: { type: 'string', description: 'ID do evento', required: true },
      completed: { type: 'boolean', description: 'Concluído ou não', required: true },
    },
  },
  {
    name: 'moveLeadStatus',
    description: 'Move um lead para outra coluna do pipeline.',
    parameters: {
      leadId: { type: 'string', description: 'ID do lead', required: true },
      status: { type: 'string', description: 'Novo status', enum: ['triagem', 'em_contato', 'sem_resposta', 'em_espera', 'proposta', 'fechado'], required: true },
    },
  },
  {
    name: 'createProject',
    description: 'Cria um projeto a partir de um lead fechado.',
    parameters: {
      leadId: { type: 'string', description: 'ID do lead fechado', required: true },
      contractNumber: { type: 'string', description: 'Número do contrato', required: false },
      deadline: { type: 'string', description: 'Prazo ISO', required: false },
      features: { type: 'array', description: 'Lista de funcionalidades', required: false },
      notes: { type: 'string', description: 'Notas', required: false },
    },
  },
  {
    name: 'updateProject',
    description: 'Atualiza um projeto existente.',
    parameters: {
      projectId: { type: 'string', description: 'ID do projeto', required: true },
      updates: { type: 'object', description: 'Campos a atualizar', required: true },
    },
  },
  {
    name: 'triggerN8NWorkflow',
    description: 'Dispara um workflow no N8N.',
    parameters: {
      workflowName: { type: 'string', description: 'Nome/identificador do workflow', required: true },
      payload: { type: 'object', description: 'Dados a enviar', required: false },
    },
  },
  {
    name: 'sendWhatsAppMessage',
    description: 'Envia mensagem de WhatsApp para um lead (requer aprovação).',
    parameters: {
      leadId: { type: 'string', description: 'ID do lead', required: true },
      message: { type: 'string', description: 'Texto da mensagem', required: true },
    },
  },
  {
    name: 'generateProposal',
    description: 'Gera um rascunho de proposta comercial para um lead.',
    parameters: {
      leadId: { type: 'string', description: 'ID do lead', required: true },
      scope: { type: 'string', description: 'Escopo da proposta', required: true },
      value: { type: 'number', description: 'Valor', required: false },
    },
  },
  {
    name: 'scheduleFollowUp',
    description: 'Agenda follow-up automático para um lead inativo.',
    parameters: {
      leadId: { type: 'string', description: 'ID do lead', required: true },
      scheduledAt: { type: 'string', description: 'Data/hora ISO', required: true },
      notes: { type: 'string', description: 'Notas', required: false },
    },
  },
  {
    name: 'searchMemory',
    description: 'Busca informações na memória do workspace.',
    parameters: {
      query: { type: 'string', description: 'Consulta', required: true },
    },
  },
];

export function buildToolsPrompt(): string {
  const lines = TOOL_DEFINITIONS.map((tool) => {
    const params = Object.entries(tool.parameters)
      .map(([name, def]) => {
        const required = def.required ? ' (obrigatório)' : ' (opcional)';
        const enumText = def.enum ? ` [valores: ${def.enum.join(', ')}]` : '';
        return `    - ${name}: ${def.type}${required}${enumText} — ${def.description}`;
      })
      .join('\n');
    return `- ${tool.name}: ${tool.description}\n${params}`;
  });

  return [
    'Você tem acesso às seguintes ferramentas:',
    '',
    lines.join('\n\n'),
    '',
    'Quando quiser usar uma ferramenta, responda APENAS com um JSON no formato:',
    '{"toolCalls": [{"tool": "nomeDaTool", "params": {...}, "reason": "por que usar"}]}',
    '',
    'Se não for usar ferramentas, responda normalmente em texto.',
    'Se precisar de aprovação do usuário, inclua "requiresApproval": true e explique a ação.',
  ].join('\n');
}

export function parseToolCalls(content: string): ToolCall[] {
  try {
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned) as { toolCalls?: ToolCall[] };
    return parsed.toolCalls || [];
  } catch {
    return [];
  }
}

export function createToolResult(tool: ToolName, success: boolean, data?: unknown, error?: string): ToolResult {
  return { tool, success, data, error };
}
