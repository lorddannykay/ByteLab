import { NextRequest, NextResponse } from 'next/server';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider, ChatMessage } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { message, history, provider = 'together', uploadedFiles = [] }: { 
      message: string; 
      history?: any[]; 
      provider?: AIProvider;
      uploadedFiles?: Array<{ name: string }>;
    } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if this is an approval message - don't process it as a chat message
    const normalizedMessage = message.trim().toLowerCase();
    const approvalKeywords = ['approved', 'approve', 'looks good', 'sounds good', 'proceed', 'go ahead'];
    const isApproval = approvalKeywords.some(keyword => 
      normalizedMessage === keyword || 
      normalizedMessage.startsWith(keyword + ' ') ||
      normalizedMessage === keyword + '.'
    );
    
    if (isApproval && normalizedMessage.length < 50) {
      // This is likely an approval, return a simple acknowledgment
      return NextResponse.json({ 
        response: '✓ Acknowledged. The outline has been approved and content generation will begin.' 
      });
    }

    // Get AI provider
    const aiProvider = providerManager.getProvider(provider);
    if (!aiProvider) {
      return NextResponse.json(
        { error: `Provider ${provider} is not available. Available: ${providerManager.getAvailableProviders().join(', ')}` },
        { status: 400 }
      );
    }

    // Retrieve relevant context from vector store
    let contextText = '';
    let fileListText = '';
    
    if (uploadedFiles.length > 0) {
      fileListText = `The user has uploaded the following files: ${uploadedFiles.map(f => f.name).join(', ')}. `;
    }
    
    if (globalVectorStore.size() > 0) {
      const results = await retrieveContext(message, globalVectorStore, 5, true);
      contextText = formatContextForPrompt(results, 2000);
    }

    // Build conversation history
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert instructional designer helping users create microlearning courses. 
${fileListText}${contextText ? `\n\nHere is relevant context extracted from the uploaded files:\n${contextText}\n\n` : uploadedFiles.length > 0 ? '\n\nYou have access to the content from these files and can reference them in your responses.\n\n' : ''}
Provide helpful, specific advice about course structure, learning objectives, content organization, and best practices for microlearning.
Be conversational and engaging. When the user mentions "the file" or "uploaded file", they are referring to the files listed above.`,
      },
      ...(history || []).slice(-10).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Generate response with fallback models for TogetherAI
    let response;
    let lastError;
    
    if (provider === 'together') {
      // Try models in order of preference
      const modelsToTry = [
        'meta-llama/Llama-3.2-3B-Instruct-Turbo', // Primary model
        'openai/gpt-oss-20b', // Fallback model
        MODELS.CHAT_FREE, // servicenow-ai/Apriel-1.6-15B-Thinker - free model
        MODELS.CHAT, // Qwen/Qwen3-Next-80B-A3b-Instruct
      ];
      
      for (const model of modelsToTry) {
        try {
          response = await aiProvider.chatCompletion(messages, {
            model,
            temperature: 0.7,
            maxTokens: 2000,
          });
          console.log(`Successfully used model: ${model}`);
          break; // Success, exit loop
        } catch (error) {
          lastError = error;
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.log(`Model ${model} failed: ${errorMsg.substring(0, 100)}`);
          // Continue to next model
        }
      }
      
      if (!response) {
        throw lastError || new Error('All TogetherAI models failed. Please check your API key and available models.');
      }
    } else {
      response = await aiProvider.chatCompletion(messages, {
        temperature: 0.7,
        maxTokens: 2000,
      });
    }

    return NextResponse.json({ response: response.content });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

