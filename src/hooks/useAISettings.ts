import { useState, useEffect, useCallback } from 'react';
import { AISettings, DEFAULT_AI_SETTINGS } from '@/ai/types';

const STORAGE_KEY = 'nexos-eye-ai-settings';

export function useAISettings() {
  const [settings, setSettings] = useState<AISettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) } : DEFAULT_AI_SETTINGS;
    } catch {
      return DEFAULT_AI_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AISettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_AI_SETTINGS);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
