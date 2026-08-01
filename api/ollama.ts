import type { VercelRequest, VercelResponse } from '@vercel/node';

const OLLAMA_API_URL = 'https://ollama.com/api/chat';
const OLLAMA_API_KEY = process.env.VITE_OLLAMA_CLOUD_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKeyHeader = req.headers['x-ollama-api-key'];
    const apiKey = typeof apiKeyHeader === 'string' ? apiKeyHeader : OLLAMA_API_KEY;

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Ollama Cloud HTTP ${response.status}: ${text}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('[Ollama Proxy Error]', error);
    return res.status(502).json({ error: error instanceof Error ? error.message : 'Failed to proxy Ollama request' });
  }
}
