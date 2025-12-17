import { AIProviderInterface, ChatMessage, ChatOptions, ChatResponse, JSONGenerationOptions } from './types';

export class AnthropicProvider implements AIProviderInterface {
  name = 'Anthropic';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  getAvailableModels(): string[] {
    return [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
    ];
  }

  async chatCompletion(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const {
      model = 'claude-3-5-haiku-20241022',
      temperature = 0.7,
      maxTokens = 4000,
    } = options;

    // Anthropic API format is slightly different
    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const body: any = {
      model,
      max_tokens: maxTokens,
      temperature,
      messages: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    };

    if (systemMessages.length > 0) {
      body.system = systemMessages.map(m => m.content).join('\n');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.content[0]?.text || '',
      usage: data.usage ? {
        promptTokens: data.usage.input_tokens || 0,
        completionTokens: data.usage.output_tokens || 0,
        totalTokens: (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0),
      } : undefined,
    };
  }

  async generateJSON<T>(
    messages: ChatMessage[],
    options: JSONGenerationOptions = {}
  ): Promise<T> {
    const {
      model = 'claude-3-5-sonnet-20241022',
      temperature = 0.3,
      maxTokens = 8000,
      retries = 1,
    } = options;

    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are a JSON generation assistant. You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. The response must be a valid JSON object matching the requested structure exactly. Start your response with { and end with }.',
    };

    const enhancedMessages = [systemMessage, ...messages.map(msg => ({
      ...msg,
      content: msg.role === 'user' 
        ? msg.content + '\n\nIMPORTANT: Respond with ONLY valid JSON. No explanations, no text before or after. Just the JSON object.'
        : msg.content,
    }))];

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.chatCompletion(enhancedMessages, {
          model,
          temperature,
          maxTokens,
        });

        try {
          return JSON.parse(response.content) as T;
        } catch (parseError) {
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              return JSON.parse(jsonMatch[0]) as T;
            } catch (e) {
              if (attempt === retries) {
                throw new Error(`Failed to parse JSON: ${response.content.substring(0, 200)}`);
              }
            }
          } else {
            if (attempt === retries) {
              throw new Error(`No JSON found in response: ${response.content.substring(0, 200)}`);
            }
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Failed to generate JSON');
  }
}

