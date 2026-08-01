import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentMessage, AISettings, ToolCall, ToolName, ToolResult, AgentResponse } from './types';
import { Lead } from '@/types/lead';
import { LeadEvent } from '@/types/leadEvent';
import { Project } from '@/types/project';
import { callLLM, callLLMWithFallback } from './llm';
import { buildToolsPrompt, parseToolCalls, createToolResult } from './tools';
import { formatSystemContext, buildSystemContext } from './context';

interface UseAgentProps {
  settings: AISettings;
  leads: Lead[];
  events: LeadEvent[];
  projects: Project[];
  userEmail: string | null;
  createLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  createEvent: (event: Omit<LeadEvent, 'id' | 'created_at' | 'updated_at'>) => Promise<LeadEvent | null>;
  updateEvent: (eventId: string, updates: Partial<LeadEvent>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  toggleEventCompleted: (eventId: string, completed: boolean) => Promise<void>;
  moveLeadStatus: (leadId: string, status: Lead['status']) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  triggerN8N?: (workflowName: string, payload?: Record<string, unknown>) => Promise<unknown>;
}

export function useAgent({
  settings,
  leads,
  events,
  projects,
  userEmail,
  createLead,
  updateLead,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventCompleted,
  moveLeadStatus,
  createProject,
  triggerN8N,
}: UseAgentProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingToolCalls, setPendingToolCalls] = useState<ToolCall[] | null>(null);

  const systemPrompt = useCallback(() => {
    const ctx = buildSystemContext(leads, events, projects as Project[], userEmail);
    return [
      formatSystemContext(ctx),
      '',
      buildToolsPrompt(),
      '',
      `Modo de execução: ${settings.autoExecute ? 'AUTOMÁTICO — você pode executar ferramentas diretamente, mas sempre resuma o que fez.' : 'APROVAÇÃO — sempre peça confirmação antes de executar qualquer ferramenta.'}`,
    ].join('\n');
  }, [leads, events, projects, userEmail, settings.autoExecute]);

  const executeTool = useCallback(async (call: ToolCall): Promise<ToolResult> => {
    try {
      switch (call.tool) {
        case 'createLead': {
          const leadData = call.params as Omit<Lead, 'id' | 'created_at' | 'updated_at'>;
          await createLead(leadData);
          return createToolResult(call.tool, true, { message: 'Lead criado.' });
        }

        case 'updateLead': {
          const { leadId, updates } = call.params as { leadId: string; updates: Partial<Lead> };
          await updateLead(leadId, updates);
          return createToolResult(call.tool, true, { message: 'Lead atualizado.' });
        }

        case 'createLeadEvent': {
          const { leadId, title, type, scheduledAt, durationMinutes, notes } = call.params as {
            leadId: string;
            title: string;
            type: LeadEvent['type'];
            scheduledAt: string;
            durationMinutes?: number;
            notes?: string;
          };
          const event = await createEvent({
            lead_id: leadId,
            title,
            type,
            scheduled_at: scheduledAt,
            duration_minutes: durationMinutes ?? null,
            notes: notes ?? null,
            completed: false,
            completed_at: null,
          });
          return createToolResult(call.tool, true, { eventId: event?.id });
        }

        case 'updateLeadEvent': {
          const { eventId, updates } = call.params as { eventId: string; updates: Partial<LeadEvent> };
          await updateEvent(eventId, updates);
          return createToolResult(call.tool, true, { message: 'Evento atualizado.' });
        }

        case 'deleteLeadEvent': {
          const { eventId } = call.params as { eventId: string };
          await deleteEvent(eventId);
          return createToolResult(call.tool, true, { message: 'Evento removido.' });
        }

        case 'toggleLeadEventCompleted': {
          const { eventId, completed } = call.params as { eventId: string; completed: boolean };
          await toggleEventCompleted(eventId, completed);
          return createToolResult(call.tool, true, { message: `Evento ${completed ? 'concluído' : 'reaberto'}.` });
        }

        case 'moveLeadStatus': {
          const { leadId, status } = call.params as { leadId: string; status: Lead['status'] };
          await moveLeadStatus(leadId, status);
          return createToolResult(call.tool, true, { message: `Lead movido para ${status}.` });
        }

        case 'createProject': {
          const { leadId, ...projectData } = call.params as { leadId: string } & Partial<Project>;
          const project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'> = {
            lead_id: leadId,
            contract_number: (projectData.contract_number as string | null) || null,
            start_date: (projectData.start_date as string | null) || null,
            deadline: (projectData.deadline as string | null) || null,
            features: Array.isArray(projectData.features) ? projectData.features.map(String) : [],
            status: (projectData.status as Project['status']) || 'briefing',
            notes: (projectData.notes as string | null) || null,
            position: 0,
          };
          await createProject(project);
          return createToolResult(call.tool, true, { message: 'Projeto criado.' });
        }

        case 'triggerN8NWorkflow': {
          const { workflowName, payload } = call.params as { workflowName: string; payload?: Record<string, unknown> };
          if (!triggerN8N) {
            return createToolResult(call.tool, false, undefined, 'Integração N8N não configurada.');
          }
          const result = await triggerN8N(workflowName, payload);
          return createToolResult(call.tool, true, result);
        }

        case 'sendWhatsAppMessage':
        case 'generateProposal':
        case 'scheduleFollowUp':
        case 'searchMemory':
          return createToolResult(call.tool, false, undefined, `Tool ${call.tool} requer implementação adicional ou integração externa.`);

        default:
          return createToolResult(call.tool as ToolName, false, undefined, `Tool desconhecida: ${call.tool}`);
      }
    } catch (error) {
      return createToolResult(call.tool, false, undefined, error instanceof Error ? error.message : String(error));
    }
  }, [createLead, updateLead, createEvent, updateEvent, deleteEvent, toggleEventCompleted, moveLeadStatus, createProject, triggerN8N]);

  const sendMessage = useCallback(async (userContent: string) => {
    setLoading(true);
    setPendingToolCalls(null);

    const userMessage: AgentMessage = {
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    };

    const systemMessage: AgentMessage = {
      role: 'system',
      content: systemPrompt(),
      timestamp: new Date().toISOString(),
    };

    const currentMessages = [...messages, userMessage];
    const llmMessages: AgentMessage[] = [systemMessage, ...currentMessages];

    const response = await callLLMWithFallback(settings, { messages: llmMessages });

    if (response.error) {
      const assistantMessage: AgentMessage = {
        role: 'assistant',
        content: `Erro ao consultar o modelo: ${response.error}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setLoading(false);
      return;
    }

    const toolCalls = parseToolCalls(response.content);

    if (toolCalls.length > 0) {
      if (!settings.autoExecute) {
        setPendingToolCalls(toolCalls);
        const assistantMessage: AgentMessage = {
          role: 'assistant',
          content: `Identifiquei ${toolCalls.length} ação(ões) para executar:\n\n${toolCalls.map((t) => `- **${t.tool}**: ${t.reason}`).join('\n')}\n\nConfirma a execução automática?`,
          toolCalls,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage, assistantMessage]);
        setLoading(false);
        return;
      }

      const results: ToolResult[] = [];
      for (const call of toolCalls) {
        const result = await executeTool(call);
        results.push(result);
      }

      const toolSummary = results
        .map((r) => `- ${r.tool}: ${r.success ? '✅ ' + JSON.stringify(r.data) : '❌ ' + r.error}`)
        .join('\n');

      const followUpMessages: AgentMessage[] = [
        ...currentMessages,
        {
          role: 'assistant',
          content: response.content,
          toolCalls,
          timestamp: new Date().toISOString(),
        },
        {
          role: 'tool',
          content: `Resultados das ferramentas:\n${toolSummary}`,
          toolResults: results,
          timestamp: new Date().toISOString(),
        },
      ];

      const finalResponse = await callLLMWithFallback(settings, {
        messages: [systemMessage, ...followUpMessages],
        temperature: 0.3,
      });

      const finalMessage: AgentMessage = {
        role: 'assistant',
        content: finalResponse.error
          ? `Executei as ações, mas não consegui gerar resumo: ${finalResponse.error}\n\n${toolSummary}`
          : finalResponse.content || `Ações executadas:\n${toolSummary}`,
        toolResults: results,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage, followUpMessages[1], followUpMessages[2], finalMessage]);
      setLoading(false);
      return;
    }

    const assistantMessage: AgentMessage = {
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setLoading(false);
  }, [messages, settings, systemPrompt, executeTool]);

  const approvePendingTools = useCallback(async () => {
    if (!pendingToolCalls || pendingToolCalls.length === 0) return;

    setLoading(true);
    const calls = pendingToolCalls;
    setPendingToolCalls(null);

    const results: ToolResult[] = [];
    for (const call of calls) {
      const result = await executeTool(call);
      results.push(result);
    }

    const toolSummary = results
      .map((r) => `- ${r.tool}: ${r.success ? '✅ ' + JSON.stringify(r.data) : '❌ ' + r.error}`)
      .join('\n');

    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    if (!lastUserMessage) return;

    const systemMessage: AgentMessage = {
      role: 'system',
      content: systemPrompt(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages: AgentMessage[] = [
      ...messages,
      {
        role: 'assistant',
        content: `Executando aprovação...`,
        toolResults: results,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'tool',
        content: `Resultados das ferramentas:\n${toolSummary}`,
        toolResults: results,
        timestamp: new Date().toISOString(),
      },
    ];

    const finalResponse = await callLLMWithFallback(settings, {
      messages: [systemMessage, ...updatedMessages],
      temperature: 0.3,
    });

    const finalMessage: AgentMessage = {
      role: 'assistant',
      content: finalResponse.error
        ? `Ações executadas com aprovação. Resumo:\n${toolSummary}`
        : finalResponse.content || `Ações executadas com aprovação:\n${toolSummary}`,
      toolResults: results,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, updatedMessages[updatedMessages.length - 2], updatedMessages[updatedMessages.length - 1], finalMessage]);
    setLoading(false);
  }, [pendingToolCalls, messages, settings, systemPrompt, executeTool]);

  const rejectPendingTools = useCallback(() => {
    setPendingToolCalls(null);
    const assistantMessage: AgentMessage = {
      role: 'assistant',
      content: 'Ok, não executei as ações. Me diga como posso ajustar.',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setPendingToolCalls(null);
  }, []);

  return {
    messages,
    loading,
    pendingToolCalls,
    sendMessage,
    approvePendingTools,
    rejectPendingTools,
    clearMessages,
  };
}
