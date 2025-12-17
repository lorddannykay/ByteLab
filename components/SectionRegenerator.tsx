'use client';

import { useState } from 'react';
import { CourseStage } from '@/types/course';
import { AIProvider } from '@/lib/ai/providers/types';

interface SectionRegeneratorProps {
  stage: CourseStage;
  stageIndex: number;
  onRegenerate: (stageIndex: number, newContent: Partial<CourseStage>) => void;
  provider: AIProvider;
  config: any;
}

export default function SectionRegenerator({
  stage,
  stageIndex,
  onRegenerate,
  provider,
  config,
}: SectionRegeneratorProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          stage: {
            id: stage.id,
            title: stage.title,
            objective: stage.objective,
            keyPoints: stage.content?.sections?.map(s => s.heading) || [],
          },
          provider,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate content');
      }

      const newContent = await response.json();
      onRegenerate(stageIndex, { content: newContent });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="mt-4 p-3 bg-bg2 border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Stage {stage.id}: {stage.title}</p>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-4 py-2 bg-accent1 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {regenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>
    </div>
  );
}

