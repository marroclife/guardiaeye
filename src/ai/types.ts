import { Lead } from '@/types/lead';
import { LeadEvent } from '@/types/leadEvent';
import { ProjectWithLead } from '@/types/project';

export type AIProvider = 'ollama-cloud' | 'ollama-local' | 'openai' | 'anthropic' | 'n8n';

export interface AISettings {
  provider: AIProvider;
  model: string;
  fallbackModel: string;
  ollamaCloudUrl: string;
  ollamaCloudApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  n8nWebhookUrl: string;
  n8nApiKey: string;
  autoExecute: boolean;
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'ollama-cloud',
  model: 'gemma4:31b-cloud',
  fallbackModel: 'kimi-k2.5:cloud',
  ollamaCloudUrl: 'https://ollama.com/api/chat',
  ollamaCloudApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  n8nWebhookUrl: 'https://nexooperator.app.n8n.cloud/webhook/',
  n8nApiKey: '',
  autoExecute: false,
};

export interface SystemContext {
  leads: Lead[];
  activeLeads: Lead[];
  archivedLeads: Lead[];
  events: LeadEvent[];
  projects: ProjectWithLead[];
  today: string;
  userEmail: string | null;
}

export type ToolName =
  | 'createLead'
  | 'updateLead'
  | 'createLeadEvent'
  | 'updateLeadEvent'
  | 'deleteLeadEvent'
  | 'toggleLeadEventCompleted'
  | 'moveLeadStatus'
  | 'createProject'
  | 'updateProject'
  | 'triggerN8NWorkflow'
  | 'sendWhatsAppMessage'
  | 'generateProposal'
  | 'scheduleFollowUp'
  | 'searchMemory'
  | 'none';

export interface ToolCall {
  tool: ToolName;
  params: Record<string, unknown>;
  reason: string;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: string;
}

export interface ToolResult {
  tool: ToolName;
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface AgentResponse {
  message: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  requiresApproval?: boolean;
}

export interface AgentSession {
  id: string;
  messages: AgentMessage[];
  createdAt: string;
  updatedAt: string;
}
