import { Langfuse } from 'langfuse';
import { CourseConfig } from '@/types/course';
import { ContentQualityScore } from '@/lib/prompts/advancedPromptEngineering';

// Initialize Langfuse client
const langfuse = new Langfuse({
  secretKey: process.env.LANGFUSE_SECRET_KEY || '',
  publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
  baseUrl: process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com',
});

/**
 * Trace content generation with Langfuse
 */
export async function traceContentGeneration(
  traceName: string,
  config: CourseConfig,
  stage: { id: number; title: string },
  systemPrompt: string,
  userPrompt: string,
  result: any,
  qualityScore?: ContentQualityScore,
  metadata?: Record<string, any>
) {
  try {
    // Only trace if Langfuse is configured
    if (!process.env.LANGFUSE_SECRET_KEY || !process.env.LANGFUSE_PUBLIC_KEY) {
      console.log('Langfuse not configured, skipping trace');
      return null;
    }

    const trace = langfuse.trace({
      name: traceName,
      metadata: {
        courseTopic: config.topic,
        courseTitle: config.title,
        stageId: stage.id,
        stageTitle: stage.title,
        provider: metadata?.provider || 'unknown',
        model: metadata?.model || 'unknown',
        ...metadata,
      },
    });

    const generation = trace.generation({
      name: 'content-generation',
      model: metadata?.model || 'unknown',
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      output: result,
      metadata: {
        qualityScore: qualityScore?.score,
        dimensions: qualityScore?.dimensions,
        issues: qualityScore?.issues,
        suggestions: qualityScore?.suggestions,
        revised: metadata?.revised || false,
        revisionAttempt: metadata?.revisionAttempt || 0,
      },
    });

    // Flush to ensure data is sent
    await langfuse.flushAsync();
    
    return generation;
  } catch (error) {
    // Don't fail the request if Langfuse tracing fails
    console.error('Langfuse tracing error (non-blocking):', error);
    return null;
  }
}

/**
 * Trace outline generation with Langfuse
 */
export async function traceOutlineGeneration(
  traceName: string,
  config: CourseConfig,
  systemPrompt: string,
  userPrompt: string,
  result: any,
  metadata?: Record<string, any>
) {
  try {
    // Only trace if Langfuse is configured
    if (!process.env.LANGFUSE_SECRET_KEY || !process.env.LANGFUSE_PUBLIC_KEY) {
      console.log('Langfuse not configured, skipping trace');
      return null;
    }

    const trace = langfuse.trace({
      name: traceName,
      metadata: {
        courseTopic: config.topic,
        courseTitle: config.title,
        stageCount: config.stageCount,
        provider: metadata?.provider || 'unknown',
        model: metadata?.model || 'unknown',
        ...metadata,
      },
    });

    const generation = trace.generation({
      name: 'outline-generation',
      model: metadata?.model || 'unknown',
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      output: result,
      metadata: {
        stagesGenerated: result?.course?.stages?.length || 0,
        expectedStages: config.stageCount,
      },
    });

    // Flush to ensure data is sent
    await langfuse.flushAsync();
    
    return generation;
  } catch (error) {
    // Don't fail the request if Langfuse tracing fails
    console.error('Langfuse tracing error (non-blocking):', error);
    return null;
  }
}

export { langfuse };

