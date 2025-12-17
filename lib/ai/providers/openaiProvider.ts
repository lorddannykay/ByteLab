import { AIProviderInterface, ChatMessage, ChatOptions, ChatResponse, JSONGenerationOptions } from './types';

export class OpenAIProvider implements AIProviderInterface {
  name = 'OpenAI';
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  getAvailableModels(): string[] {
    return [
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ];
  }

  async chatCompletion(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const {
      model = 'gpt-4o-mini',
      temperature = 0.7,
      maxTokens = 4000,
      responseFormat = 'text',
    } = options;

    const body: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0,
      } : undefined,
    };
  }

  async generateJSON<T>(
    messages: ChatMessage[],
    options: JSONGenerationOptions = {}
  ): Promise<T> {
    const {
      model = 'gpt-4o-mini',
      temperature = 0.3,
      maxTokens = 8000,
      retries = 1, // OpenAI is more reliable, fewer retries needed
    } = options;

    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are a JSON generation assistant. You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. The response must be a valid JSON object matching the requested structure exactly.',
    };

    const enhancedMessages = [systemMessage, ...messages];

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.chatCompletion(enhancedMessages, {
          model,
          temperature,
          maxTokens,
          responseFormat: 'json_object',
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

