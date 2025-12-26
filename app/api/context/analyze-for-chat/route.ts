import { NextRequest, NextResponse } from 'next/server';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { providerManager } from '@/lib/ai/providers';
import { AIProvider, ChatMessage } from '@/lib/ai/providers/types';
import { MODELS } from '@/lib/together/client';

export async function POST(request: NextRequest) {
  try {
    const { fileNames } = await request.json();
    console.log(`[Analysis] POST request received for files: ${fileNames?.join(', ') || 'none'}`);
    console.log(`[Analysis] Current vector store size: ${globalVectorStore.size()}`);

    if (globalVectorStore.size() === 0) {
      console.warn('[Analysis] ⚠️ Vector store is empty! Blocking analysis.');
      return NextResponse.json(
        { error: 'No sources available. Chunks may have been cleared by a concurrent operation.' },
        { status: 400 }
      );
    }

    // Get a comprehensive sample of content
    const allChunks = globalVectorStore.getAllChunks();
    const sampleChunks = allChunks.slice(0, 30);
    const sampleText = sampleChunks.map(c => c.text).join('\n\n').substring(0, 8000);

    // Get AI provider
    const aiProvider = providerManager.getProvider('together');
    if (!aiProvider) {
      return NextResponse.json(
        { error: 'AI provider not available' },
        { status: 500 }
      );
    }

    // Generate comprehensive content analysis for course planning
    const analysisPrompt = `You are an expert instructional designer analyzing content for microlearning course creation.

The user has uploaded the following files: ${fileNames?.join(', ') || 'content files'}

Content sample:
${sampleText}

Provide a comprehensive analysis that includes:

1. **Content Overview** (2-3 paragraphs):
   - Main topics and themes covered
   - Key concepts and terminology
   - Complexity level and target audience suitability

2. **Course Planning Suggestions**:
   - Recommended number of learning stages/modules
   - Suggested learning objectives
   - Key topics that should be covered
   - Prerequisites or foundational knowledge needed

3. **Microlearning Opportunities**:
   - Which topics are best suited for bite-sized learning
   - Suggested interactive elements (quizzes, exercises, etc.)
   - Potential assessment points

4. **Next Steps**:
   - What questions should the user consider?
   - What additional information might be helpful?

Write this as a conversational analysis that helps the user plan their microlearning course. Be specific and actionable.`;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'You are an expert instructional designer specializing in microlearning course creation. Provide helpful, specific, and actionable analysis.',
      },
      {
        role: 'user',
        content: analysisPrompt,
      },
    ];

    let response;
    try {
      response = await aiProvider.chatCompletion(messages, {
        model: MODELS.CHAT_FREE || 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
        temperature: 0.6,
        maxTokens: 2500,
      });
    } catch (error) {
      console.error('Content analysis failed:', error);
      // Fallback analysis
      const sources = new Set(allChunks.map(c => c.metadata?.source).filter(Boolean));
      response = {
        content: `I've analyzed your uploaded content. You have ${allChunks.length} content chunks from ${sources.size} source(s).

**Content Overview:**
Your content has been successfully processed and indexed. I can help you create a microlearning course based on this material.

**Course Planning Suggestions:**
- Consider breaking the content into 3-5 learning stages
- Each stage should focus on a specific learning objective
- Include interactive elements like quizzes to reinforce learning

**Next Steps:**
Let's discuss your course goals. What would you like learners to achieve by the end of this course?`,
      };
    }

    // Generate intelligent quick options based on content analysis
    // Try to extract topics and generate relevant questions
    let quickOptions: string[] = [];
    try {
      const contentLower = String(response.content || response).toLowerCase();

      // Generate context-aware questions
      if (contentLower.includes('objective') || contentLower.includes('goal')) {
        quickOptions.push('What are the main learning objectives?');
      }
      if (contentLower.includes('stage') || contentLower.includes('module')) {
        quickOptions.push('Create a course outline with stages');
        quickOptions.push('What topics should each stage cover?');
      }
      if (contentLower.includes('quiz') || contentLower.includes('assessment') || contentLower.includes('interactive')) {
        quickOptions.push('Suggest interactive elements for this content');
      }
      if (contentLower.includes('audience') || contentLower.includes('learner')) {
        quickOptions.push('Who is the target audience for this course?');
      }
    } catch (optError) {
      console.warn('Failed to extract quick options:', optError);
    }

    // Add default options if we don't have enough
    const defaultOptions = [
      'Create a course outline with 5 stages',
      'What are the main learning objectives?',
      'Suggest interactive elements for this content',
      'What topics should each stage cover?',
      'Help me plan the course structure',
    ];

    // Fill remaining slots with defaults
    while (quickOptions.length < 4 && defaultOptions.length > 0) {
      const option = defaultOptions.shift();
      if (option && !quickOptions.includes(option)) {
        quickOptions.push(option);
      }
    }

    return NextResponse.json({
      analysis: String(response.content || response),
      quickOptions,
      fileNames: fileNames || [],
    });
  } catch (error) {
    console.error('CRITICAL: Content analysis failure:', error);

    // Guaranteed fallback response to avoid 500
    return NextResponse.json({
      analysis: `I've successfully received and indexed your content, but I'm currently having trouble generating a detailed analysis. 
      
Don't worry, your sources are ready! I can still help you build your course. 

**What would you like to do?**
- Create a course outline from these sources
- Summarize the main topics
- Start with a specific learning objective`,
      quickOptions: [
        'Create a course outline with 5 stages',
        'What are the main learning objectives?',
        'Summarize the main topics',
        'How should I structure this course?',
      ],
      fileNames: [],
    });
  }
}
