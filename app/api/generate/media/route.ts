import { NextRequest, NextResponse } from 'next/server';
import { VideoScene, DialogueSegment } from '@/types/course';
import { buildVideoPrompt } from '@/lib/prompts/videoPrompt';
import { buildPodcastPrompt } from '@/lib/prompts/podcastPrompt';
import { providerManager } from '@/lib/ai/providers';
import { retrieveContext, formatContextForPrompt } from '@/lib/rag/retrieval';
import { globalVectorStore } from '@/lib/rag/vectorStore';
import { generateAudioDataURL, DEFAULT_VOICES } from '@/lib/tts/edgeTTS';
import { AIProvider } from '@/lib/ai/providers/types';

export async function POST(request: NextRequest) {
  try {
    const {
      config,
      stages,
      provider = 'together',
    }: {
      config: any;
      stages: any[];
      provider?: AIProvider;
    } = await request.json();

    if (!stages || stages.length === 0) {
      return NextResponse.json(
        { error: 'No stages provided' },
        { status: 400 }
      );
    }

    // Get AI provider
    const aiProvider = providerManager.getProvider(provider);
    if (!aiProvider) {
      return NextResponse.json(
        { error: `Provider ${provider} is not available` },
        { status: 400 }
      );
    }

    // Retrieve context if available
    let contextText = '';
    if (globalVectorStore.size() > 0) {
      const query = `${config.topic} ${config.description || ''}`;
      const results = await retrieveContext(query, globalVectorStore, 5, true);
      contextText = formatContextForPrompt(results, 2000);
    }

    // Generate video scenes using AI
    const videoScenes: VideoScene[] = [];
    for (const stage of stages) {
      try {
        const videoPrompt = buildVideoPrompt(config, stage, contextText);
        const videoResponse = await aiProvider.generateJSON(
          [
            { role: 'system', content: 'You are a content creator specializing in typography-based video courses. Generate concise, visual-focused scenes.' },
            { role: 'user', content: videoPrompt },
          ],
          {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  text: { type: 'string' },
                },
                required: ['id', 'text'],
              },
            },
          }
        );

        if (videoResponse && Array.isArray(videoResponse)) {
          const scenes = videoResponse.map((scene: any) => ({
            id: videoScenes.length + scene.id,
            text: scene.text,
          }));
          videoScenes.push(...scenes);
        } else {
          // Fallback if AI generation fails
          videoScenes.push({
            id: videoScenes.length + 1,
            text: `${stage.title}. ${stage.objective}`,
          });
        }
      } catch (error) {
        console.error(`Error generating video scenes for stage ${stage.id}:`, error);
        // Fallback
        videoScenes.push({
          id: videoScenes.length + 1,
          text: `${stage.title}. ${stage.objective}`,
        });
      }
    }

    // Generate podcast dialogue using AI
    const dialogue: DialogueSegment[] = [];
    
    // Opening dialogue
    dialogue.push({
      speaker: 'host',
      text: `Welcome to the ByteAI Podcast! Today we're exploring ${config.topic}.`,
    });
    dialogue.push({
      speaker: 'expert',
      text: `Thanks for having me! I'm excited to share insights about ${config.topic}.`,
    });

    // Generate dialogue for each stage
    for (const stage of stages) {
      try {
        const podcastPrompt = buildPodcastPrompt(config, stage, contextText);
        const podcastResponse = await aiProvider.generateJSON(
          [
            { role: 'system', content: 'You are a podcast script writer. Create natural, conversational dialogue between a host and an expert.' },
            { role: 'user', content: podcastPrompt },
          ],
          {
            schema: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  speaker: { type: 'string', enum: ['host', 'expert'] },
                  text: { type: 'string' },
                },
                required: ['speaker', 'text'],
              },
            },
          }
        );

        if (podcastResponse && Array.isArray(podcastResponse)) {
          dialogue.push(...podcastResponse);
        } else {
          // Fallback if AI generation fails
          dialogue.push({
            speaker: 'host',
            text: `Let's talk about ${stage.title}. What should learners know?`,
          });
          dialogue.push({
            speaker: 'expert',
            text: `${stage.objective}. ${stage.content?.introduction || 'This is an important concept to understand.'}`,
          });
        }
      } catch (error) {
        console.error(`Error generating podcast dialogue for stage ${stage.id}:`, error);
        // Fallback
        dialogue.push({
          speaker: 'host',
          text: `Let's discuss ${stage.title}.`,
        });
        dialogue.push({
          speaker: 'expert',
          text: `${stage.objective}`,
        });
      }
    }

    // Closing dialogue
    dialogue.push({
      speaker: 'host',
      text: 'Thank you for this insightful conversation!',
    });

    // Generate audio for video scenes
    const videoScenesWithAudio = await Promise.all(
      videoScenes.map(async (scene) => {
        try {
          const audioDataURL = await generateAudioDataURL(scene.text, DEFAULT_VOICES.video);
          return {
            ...scene,
            audioDataURL,
          };
        } catch (error) {
          console.error(`Error generating audio for video scene ${scene.id}:`, error);
          return scene; // Return without audio if generation fails
        }
      })
    );

    // Generate audio for podcast dialogue
    const dialogueWithAudio = await Promise.all(
      dialogue.map(async (segment) => {
        try {
          const voice = segment.speaker === 'host' ? DEFAULT_VOICES.podcastHost : DEFAULT_VOICES.podcastExpert;
          const audioDataURL = await generateAudioDataURL(segment.text, voice);
          return {
            ...segment,
            audioDataURL,
          };
        } catch (error) {
          console.error(`Error generating audio for podcast segment:`, error);
          return segment; // Return without audio if generation fails
        }
      })
    );

    return NextResponse.json({
      videoScenes: videoScenesWithAudio,
      podcastDialogue: dialogueWithAudio,
    });
  } catch (error) {
    console.error('Media generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate media scripts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

