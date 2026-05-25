import { useState } from 'react';
import { generateAI, type AIResult } from '@/api/ai';
import type { AIGenerateBody } from '@shared/api';

export function useAIGenerate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const generate = async (body: AIGenerateBody): Promise<AIResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await generateAI(body);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Nonna teve um problema. Tente de novo!';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generate, isLoading, error };
}
