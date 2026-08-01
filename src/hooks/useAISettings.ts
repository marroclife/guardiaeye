import { useState, useEffect, useCallback } from 'react';
import { AISettings, DEFAULT_AI_SETTINGS } from '@/ai/types';

const STORAGE_KEY = 'nexos-eye-ai-settings';
const ENV_API_KEY = (import.meta.env.VITE_OLLAMA_CLOUD_API_KEY || '').toString();

function cleanApiKey(key: string): string {
  return key.replace(/[^\x20-\x7E]/g, '').trim();
}

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      return {
        ...DEFAULT_AI_SETTINGS,
        ...parsed,
        ollamaCloudApiKey: cleanApiKey(parsed.ollamaCloudApiKey || ENV_API_KEY || ''),
      };
    } catch {
      return { ...DEFAULT_AI_SETTINGS, ollamaCloudApiKey: cleanApiKey(ENV_API_KEY) };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AISettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
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
