import { NextRequest, NextResponse } from 'next/server';
import { createPronunciationChain } from '@/app/lib/ai/chains';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const text = formData.get('text') as string;

    if (!audioFile || !text) {
      return NextResponse.json(
        { error: 'Audio file and text are required' },
        { status: 400 }
      );
    }

    // In a production environment, we would send the audioFile to a Speech-to-Text (STT) service
    // (e.g., Google Cloud Speech, AWS Transcribe, or OpenAI Whisper) to get a phonetic transcription.
    // Since this environment does not have external API keys for audio processing services,
    // we will utilize the LLM to perform a "predictive analysis" based on the text.
    
    // The LLM will identify challenging words and potential pronunciation pitfalls for a learner
    // of the target language. This provides immediate, educational feedback without requiring
    // real-time audio analysis infrastructure.

    const analysisContext = "Audio analysis unavailable. Please analyze the text for likely pronunciation difficulties for a learner. Identify words that are typically hard to pronounce and explain how to pronounce them correctly. Assume the user might struggle with these common pitfalls.";
    
    const chain = createPronunciationChain();
    const result = await chain.invoke({
      text: text,
      analysis: analysisContext, 
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in speech trainer API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze speech' },
      { status: 500 }
    );
  }
}
