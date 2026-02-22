import { NextRequest, NextResponse } from 'next/server';
import { createConversationChain } from '@/app/lib/ai/chains';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { getSubscription } from "@/app/lib/subscription";
import { auth } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import Conversation from "@/app/lib/models/Conversation";

// GET: Fetch conversation history (list)
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const conversations = await Conversation.find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .select('title createdAt messages mode')
    .limit(20);

  const history = conversations.map(c => ({
    id: c._id,
    title: c.title,
    date: c.createdAt,
    preview: c.messages[c.messages.length - 1]?.content || "New conversation",
    mode: c.mode
  }));

  return NextResponse.json(history);
}

// POST: Send message and get response
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getSubscription();

    if (!subscription || subscription.plan !== 'premium' || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Premium subscription required' },
        { status: 403 }
      );
    }

    const { message, sessionId, mode } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    await connectDB();

    let conversation;
    let chatHistory = [];

    if (sessionId) {
        conversation = await Conversation.findOne({ _id: sessionId, userId: session.user.id });
    }

    if (!conversation) {
        conversation = new Conversation({
            userId: session.user.id,
            mode: mode || 'casual',
            messages: [],
            title: message.substring(0, 30) + (message.length > 30 ? '...' : '')
        });
    }

    // Prepare history for LangChain
    chatHistory = conversation.messages.map((msg: any) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else {
        return new AIMessage(msg.content);
      }
    });

    // Initialize the conversation chain
    const chain = createConversationChain();
    
    // Invoke the chain
    const result = await chain.invoke({
      message,
      history: chatHistory,
    });

    // Save to DB
    conversation.messages.push({
        role: 'user',
        content: message
    });

    conversation.messages.push({
        role: 'assistant',
        content: result.response,
        corrections: result.corrections,
        translation: result.translation
    });

    await conversation.save();

    return NextResponse.json({
        ...result,
        sessionId: conversation._id
    });
  } catch (error) {
    console.error('Error in conversation API:', error);
    return NextResponse.json(
      { error: 'Failed to process conversation' },
      { status: 500 }
    );
  }
}
