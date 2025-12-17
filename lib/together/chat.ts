import { together, MODELS } from './client';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json_object';
  stream?: boolean;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  if (!together.apiKey) {
    throw new Error('TOGETHER_API_KEY is not configured. Please set it in .env.local');
  }

  const {
    model = MODELS.CHAT,
    temperature = 0.7,
    maxTokens = 4000,
    responseFormat = 'text',
    stream = false,
  } = options;

  try {
    const body: any = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    if (responseFormat === 'json_object') {
      body.response_format = { type: 'json_object' };
    }

    if (stream) {
      body.stream = true;
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
      throw new Error(`Chat API error: ${response.status} - ${error}`);
    }

    if (stream) {
      // Handle streaming response (not implemented yet)
      return '';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error in chat completion:', error);
    throw error;
  }
}

export async function generateJSON<T>(
  messages: ChatMessage[],
  options: Omit<ChatOptions, 'responseFormat'> = {}
): Promise<T> {
  // Increase maxTokens if not specified to avoid truncation
  const maxTokens = options.maxTokens || 4000;
  
  const response = await chatCompletion(messages, {
    ...options,
    maxTokens: Math.max(maxTokens, 4000), // Ensure at least 4000 tokens
    responseFormat: 'json_object',
  });

  // Log response length for debugging
  console.log(`Response length: ${response.length} characters`);

  try {
    // Try direct parse first
    return JSON.parse(response) as T;
  } catch (error) {
    // If direct parse fails, try to extract JSON from text
    console.warn('Direct JSON parse failed, attempting to extract JSON from response...');
    console.log('Response preview:', response.substring(0, 200));
    
    // Try to find JSON object in the response (handles cases where model adds text before/after)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = jsonMatch[0];
        // Try to fix incomplete JSON by finding the last complete object
        let fixedJson = extracted;
        
        // If JSON seems incomplete, try to close it
        if (!extracted.endsWith('}')) {
          // Count braces to see if we can auto-close
          const openBraces = (extracted.match(/\{/g) || []).length;
          const closeBraces = (extracted.match(/\}/g) || []).length;
          const missing = openBraces - closeBraces;
          
          // Check if JSON is extremely incomplete (like just {"course":)
          if (extracted.includes('"course"') && !extracted.includes('"stages"')) {
            console.error('JSON is too incomplete - only has "course" but no "stages"');
            console.error('This usually means the model hit token limits');
            throw new Error('JSON response is too incomplete. The model may have hit token limits. Try reducing the number of stages or using a model with higher token limits.');
          }
          
          if (missing > 0 && missing <= 5) {
            // Try to close the JSON structure intelligently
            // Find the last incomplete property
            const lastColon = extracted.lastIndexOf(':');
            const lastComma = extracted.lastIndexOf(',');
            const lastQuote = extracted.lastIndexOf('"');
            
            if (lastColon > lastComma && lastColon > lastQuote) {
              // We have an incomplete property value
              // Try to close it with a placeholder
              const beforeColon = extracted.substring(0, lastColon);
              const propertyMatch = beforeColon.match(/"([^"]+)":\s*$/);
              
              if (propertyMatch) {
                const propName = propertyMatch[1];
                // Create a minimal valid structure
                if (propName === 'course') {
                  // We need at least: {"course": {"title": "", "description": "", "duration": "", "stages": []}}
                  fixedJson = `{"course": {"title": "", "description": "", "duration": "", "stages": []}}`;
                  console.log('Created minimal valid JSON structure due to incomplete response');
                } else {
                  // For other properties, try to close with empty value
                  fixedJson = beforeColon + ': ""}'.repeat(missing);
                }
              } else {
                fixedJson = extracted + '}'.repeat(missing);
              }
            } else {
              // Just add missing closing braces
              fixedJson = extracted + '}'.repeat(missing);
            }
            console.log('Attempting to fix incomplete JSON by adding closing braces');
          }
        }
        
        try {
          return JSON.parse(fixedJson) as T;
        } catch (parseError) {
          // If fixing didn't work, throw the original error
          throw parseError;
        }
      } catch (parseError) {
        console.error('Error parsing extracted JSON:', parseError);
        console.error('Extracted JSON was:', jsonMatch[0].substring(0, 500));
      }
    }
    
    // If still failing, try to find JSON array
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]) as T;
      } catch (parseError) {
        console.error('Error parsing extracted JSON array:', parseError);
      }
    }
    
    console.error('Error parsing JSON response:', error);
    console.error('Full response (first 1000 chars):', response.substring(0, 1000));
    console.error('Full response (last 500 chars):', response.substring(Math.max(0, response.length - 500)));
    
    throw new Error(`Failed to parse JSON response from AI. Response was ${response.length} chars. The model may have hit token limits or returned incomplete JSON.`);
  }
}

