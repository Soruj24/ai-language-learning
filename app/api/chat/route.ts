import { streamText } from 'ai';
import { TUTOR_SYSTEM_PROMPT } from '@/app/lib/tutor-prompt';
import { getAIModel } from '@/app/lib/ai/ai-sdk-provider';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: getAIModel(),
    system: TUTOR_SYSTEM_PROMPT,
    messages,
  });

  return result.toTextStreamResponse();
}
