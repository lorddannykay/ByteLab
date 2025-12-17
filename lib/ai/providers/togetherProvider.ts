import { AIProviderInterface, ChatMessage, ChatOptions, ChatResponse, JSONGenerationOptions } from './types';
import { together, MODELS } from '@/lib/together/client';

export class TogetherAIProvider implements AIProviderInterface {
  name = 'TogetherAI';

  isAvailable(): boolean {
    return !!together.apiKey;
  }

  getAvailableModels(): string[] {
    return [
      'meta-llama/Llama-3.2-3B-Instruct-Turbo', // Primary model
      'openai/gpt-oss-20b', // Fallback model
      'meta-llama/Llama-3.1-8B-Instruct-Turbo',
      'meta-llama/Llama-3.1-70B-Instruct-Turbo',
      'Qwen/Qwen2.5-72B-Instruct',
    ];
  }

  async chatCompletion(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<ChatResponse> {
    if (!together.apiKey) {
      throw new Error('TOGETHER_API_KEY is not configured');
    }

    const {
      model = MODELS.CHAT,
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

    const response = await fetch(`${together.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${together.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`TogetherAI API error: ${response.status} - ${error}`);
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
      model = 'meta-llama/Llama-3.1-70B-Instruct-Turbo', // Use larger model for JSON
      temperature = 0.3,
      maxTokens = 8000, // Increased for complete JSON
      retries = 2,
    } = options;

    // Ensure JSON format
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
          responseFormat: 'json_object',
        });

        // Try to parse JSON
        try {
          return JSON.parse(response.content) as T;
        } catch (parseError) {
          // Try to extract JSON from response
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              return JSON.parse(jsonMatch[0]) as T;
            } catch (e) {
              if (attempt === retries) {
                throw new Error(`Failed to parse JSON after ${retries + 1} attempts. Response: ${response.content.substring(0, 200)}`);
              }
            }
          } else {
            if (attempt === retries) {
              throw new Error(`No JSON found in response after ${retries + 1} attempts. Response: ${response.content.substring(0, 200)}`);
            }
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Failed to generate JSON');
  }
}

