import { NextRequest, NextResponse } from 'next/server';
import { createConversationChain } from '@/app/lib/ai/chains';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { getSubscription } from "@/app/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const subscription = await getSubscription();

    if (!subscription || subscription.plan !== 'premium' || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Convert history to LangChain message format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatHistory = history.map((msg: any) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });

    // Initialize the conversation chain
    // Note: Ideally we'd inject the mode into the prompt, but the current chain 
    // implementation might need a slight adjustment to accept 'mode' if not already handling it via history context.
    // The current createConversationChain prompt says "You are a helpful language conversation partner..."
    // We can prepend a system message or rely on the history. 
    // Let's stick to the chain as defined for now, which takes { message, history }.
    
    const chain = createConversationChain();
    
    // Invoke the chain
    const result = await chain.invoke({
      message,
      history: chatHistory,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in conversation API:', error);
    return NextResponse.json(
      { error: 'Failed to process conversation' },
      { status: 500 }
    );
  }
}
