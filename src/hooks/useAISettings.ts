import { useState, useEffect, useCallback } from 'react';
import { AISettings, DEFAULT_AI_SETTINGS } from '@/ai/types';

const STORAGE_KEY = 'nexos-eye-ai-settings';
const ENV_API_KEY = (import.meta.env.VITE_OLLAMA_CLOUD_API_KEY || '').toString();
const OLLAMA_CLOUD_DEFAULT_URL = 'https://ollama.com/api/chat';

function cleanApiKey(key: string): string {
  return key.replace(/[^\x20-\x7E]/g, '').trim();
}

function migrateSettings(parsed: Partial<AISettings>): Partial<AISettings> {
  const migrated: Partial<AISettings> = { ...parsed };

  // Ollama Cloud must always use the official endpoint, never N8N
  if (migrated.provider === 'ollama-cloud') {
    migrated.ollamaCloudUrl = OLLAMA_CLOUD_DEFAULT_URL;
  }

  // If old broken N8N URL is still stored, reset it
  if (
    migrated.ollamaCloudUrl &&
    migrated.ollamaCloudUrl.includes('n8n')
  ) {
    migrated.ollamaCloudUrl = OLLAMA_CLOUD_DEFAULT_URL;
  }

  return migrated;
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      const migrated = migrateSettings(parsed);
      return {
        ...DEFAULT_AI_SETTINGS,
        ...migrated,
        ollamaCloudApiKey: cleanApiKey(parsed.ollamaCloudApiKey || ENV_API_KEY || ''),
      };
    } catch {
      return { ...DEFAULT_AI_SETTINGS, ollamaCloudApiKey: cleanApiKey(ENV_API_KEY) };
    }
  });

  // Force correct Ollama Cloud URL whenever provider is ollama-cloud
  useEffect(() => {
    if (settings.provider === 'ollama-cloud' && settings.ollamaCloudUrl !== OLLAMA_CLOUD_DEFAULT_URL) {
      setSettings((prev) => ({ ...prev, ollamaCloudUrl: OLLAMA_CLOUD_DEFAULT_URL }));
    }
  }, [settings.provider, settings.ollamaCloudUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AISettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      if (next.provider === 'ollama-cloud') {
        next.ollamaCloudUrl = OLLAMA_CLOUD_DEFAULT_URL;
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULT_AI_SETTINGS, ollamaCloudApiKey: cleanApiKey(ENV_API_KEY) });
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
