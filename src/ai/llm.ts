import { AISettings, AgentMessage } from './types';

export interface LLMRequest {
  messages: AgentMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  error?: string;
}

export async function callLLM(settings: AISettings, request: LLMRequest): Promise<LLMResponse> {
  switch (settings.provider) {
    case 'ollama-cloud':
      return callOllamaCloud(settings, request);
    case 'ollama-local':
      return callOllamaLocal(settings, request);
    case 'openai':
      return callOpenAI(settings, request);
    case 'anthropic':
      return callAnthropic(settings, request);
    case 'n8n':
      return callN8N(settings, request);
    default:
      return { content: '', error: `Provider não suportado: ${settings.provider}` };
  }
}

export async function callLLMWithFallback(settings: AISettings, request: LLMRequest): Promise<LLMResponse> {
  const primary = await callLLM(settings, request);
  if (primary.content && !primary.error) return primary;

  if (settings.provider === 'ollama-cloud' && settings.fallbackModel && settings.fallbackModel !== settings.model) {
    const fallbackSettings = { ...settings, model: settings.fallbackModel };
    const fallback = await callLLM(fallbackSettings, request);
    if (fallback.content && !fallback.error) {
      return { content: fallback.content, error: `(fallback: ${settings.fallbackModel})` };
    }
  }

  return primary;
}

async function callOllamaCloud(settings: AISettings, request: LLMRequest): Promise<LLMResponse> {
  const url = settings.ollamaCloudUrl.replace(/\/$/, '') + '/api/chat';

  const makeRequest = async (model: string): Promise<Response> => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.ollamaCloudApiKey ? { Authorization: `Bearer ${settings.ollamaCloudApiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: request.messages.map((m) => ({
          role: m.role === 'tool' ? 'user' : m.role,
          content: m.content,
        })),
        stream: false,
        options: {
          temperature: request.temperature ?? 0.3,
          top_p: 0.9,
          num_predict: request.maxTokens ?? 2048,
        },
      }),
    });
  };

  try {
    let response = await makeRequest(settings.model);

    if (response.status === 429 && settings.ollamaCloudApiKey) {
      await new Promise((r) => setTimeout(r, 2000));
      response = await makeRequest(settings.model);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama Cloud HTTP ${response.status}: ${text}`);
    }

    const data = (await response.json()) as { message?: { content?: string }; done_reason?: string };
    const content = data.message?.content || '';

    if (data.done_reason === 'length' && content.length < 80 && settings.fallbackModel) {
      const retryResponse = await makeRequest(settings.fallbackModel);
      if (retryResponse.ok) {
        const retryData = (await retryResponse.json()) as { message?: { content?: string } };
        if (retryData.message?.content && retryData.message.content.length > content.length) {
          return { content: retryData.message.content, error: `(fallback: ${settings.fallbackModel})` };
        }
      }
    }

    return { content };
  } catch (error) {
    return {
      content: '',
      error: `Erro ao chamar Ollama Cloud: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function callOllamaLocal(settings: AISettings, request: LLMRequest): Promise<LLMResponse> {
  return {
    content: '',
    error: 'Execução local desativada. Configure Ollama Cloud ou outro provedor.',
  };
}

async function callOpenAI(settings: AISettings, request: LLMRequest): Promise<LLMResponse> {
  if (!settings.openaiApiKey) {
    return { content: '', error: 'OpenAI API key não configurada.' };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: settings.model || 'gpt-4o-mini',
        messages: request.messages.map((m) => ({
          role: m.role === 'tool' ? 'user' : m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.3,
        max_tokens: request.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI HTTP ${response.status}: ${text}`);
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return { content: data.choices?.[0]?.message?.content || '' };
  } catch (error) {
    return {
      content: '',
      error: `Erro ao chamar OpenAI: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function callAnthropic(settings: AISettings, request: LLMRequest): Promise<LLMResponse> {
  if (!settings.anthropicApiKey) {
    return { content: '', error: 'Anthropic API key não configurada.' };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: settings.model || 'claude-3-5-sonnet-20241022',
        max_tokens: request.maxTokens ?? 2048,
        temperature: request.temperature ?? 0.3,
        messages: request.messages.map((m) => ({
          role: m.role === 'tool' || m.role === 'system' ? 'user' : m.role,
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic HTTP ${response.status}: ${text}`);
    }

    const data = (await response.json()) as { content?: { type: string; text: string }[] };
    const text = data.content?.find((c) => c.type === 'text')?.text || '';
    return { content: text };
  } catch (error) {
    return {
      content: '',
      error: `Erro ao chamar Anthropic: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function callN8N(settings: AISettings, request: LLMRequest): Promise<LLMResponse> {
  const url = settings.n8nWebhookUrl.replace(/\/$/, '');
  if (!url) {
    return { content: '', error: 'URL do webhook N8N não configurada.' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(settings.n8nApiKey ? { 'Authorization': `Bearer ${settings.n8nApiKey}` } : {}),
      },
      body: JSON.stringify({
        model: settings.model,
        messages: request.messages,
        temperature: request.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`N8N HTTP ${response.status}: ${text}`);
    }

    const data = (await response.json()) as { content?: string; message?: string };
    return { content: data.content || data.message || '' };
  } catch (error) {
    return {
      content: '',
      error: `Erro ao chamar N8N: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
