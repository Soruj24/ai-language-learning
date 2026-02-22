import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import Conversation from "@/app/lib/models/Conversation";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  await connectDB();
  const conversation = await Conversation.findOne({ _id: id, userId: session.user.id });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}
