import { auth } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { calculateSRS } from "@/app/lib/srs";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dueFlashcards = (user.flashcards || []).filter((card: any) => {
    return new Date(card.nextReview) <= now;
  });

  return NextResponse.json(dueFlashcards);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { front, back, context } = await req.json();

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.flashcards) {
    user.flashcards = [];
  }

  // Check if card already exists
  const existingCard = user.flashcards.find(
    (card: { front: string }) => card.front === front,
  );
  if (existingCard) {
    existingCard.mistakeCount += 1;
    // If user made a mistake again, reset the SRS for this card
    existingCard.nextReview = new Date();
    existingCard.interval = 0;
    existingCard.repetition = 0;
    existingCard.easeFactor = Math.max(1.3, existingCard.easeFactor - 0.2);
  } else {
    user.flashcards.push({
      front,
      back,
      context,
      nextReview: new Date(),
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      mistakeCount: 1,
    });
  }

  await user.save();
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId, quality } = await req.json(); // quality: 0-5

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.flashcards) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const card = user.flashcards.id(cardId);
  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const result = calculateSRS(
    quality,
    card.interval,
    card.repetition,
    card.easeFactor,
  );

  card.interval = result.interval;
  card.repetition = result.repetition;
  card.easeFactor = result.easeFactor;
  card.nextReview = result.nextReview;

  await user.save();
  return NextResponse.json({ success: true, nextReview: result.nextReview });
}
