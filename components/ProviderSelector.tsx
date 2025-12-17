'use client';

import { useState, useEffect } from 'react';
import { AIProvider } from '@/lib/ai/providers/types';

interface ProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  availableProviders?: AIProvider[];
}

export default function ProviderSelector({ 
  selectedProvider, 
  onProviderChange,
  availableProviders = ['together', 'openai', 'anthropic']
}: ProviderSelectorProps) {
  const [providers, setProviders] = useState<AIProvider[]>(availableProviders);

  useEffect(() => {
    // Fetch available providers from API
    fetch('/api/providers')
      .then(res => res.json())
      .then(data => {
        if (data.available && Array.isArray(data.available)) {
          setProviders(data.available);
        }
      })
      .catch(err => console.error('Error fetching providers:', err));
  }, []);

  const providerLabels: Record<AIProvider, string> = {
    together: 'TogetherAI',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
  };

  const providerDescriptions: Record<AIProvider, string> = {
    together: 'Fast, cost-effective (Llama models)',
    openai: 'High quality (GPT-4, GPT-4o)',
    anthropic: 'Excellent reasoning (Claude 3.5)',
  };

  return (
    <div className="bg-bg2 border border-border rounded-lg p-4">
      <label className="block text-sm font-semibold mb-3">
        AI Provider
      </label>
      <div className="space-y-2">
        {providers.map((provider) => (
          <label
            key={provider}
            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedProvider === provider
                ? 'border-accent1 bg-accent1/10'
                : 'border-border hover:bg-bg3'
            }`}
          >
            <input
              type="radio"
              name="provider"
              value={provider}
              checked={selectedProvider === provider}
              onChange={() => onProviderChange(provider)}
              className="w-4 h-4 text-accent1"
            />
            <div className="flex-1">
              <div className="font-medium">{providerLabels[provider]}</div>
              <div className="text-xs text-gray-600">{providerDescriptions[provider]}</div>
            </div>
          </label>
        ))}
      </div>
      {providers.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          No providers available. Please configure API keys in your environment.
        </p>
      )}
    </div>
  );
}

