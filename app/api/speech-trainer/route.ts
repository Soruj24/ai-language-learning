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

    // In a real app, we would process the audio file here to extract phonemes or transcode it.
    // For this implementation, we'll simulate the analysis or pass a placeholder.
    // We'll use the text provided by the user (what they intended to say) as context.

    // Mock analysis for now, or use a speech-to-text service if available.
    // Since we are using the chain which expects text and analysis, we will mock the analysis part
    // or rely on the LLM to infer from the text what the likely issues might be if we provided the transcription.
    
    // For now, we'll just pass the text to the chain.
    const chain = createPronunciationChain();
    const result = await chain.invoke({
      text: text,
      analysis: "User audio input provided (simulated phoneme analysis)", 
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
