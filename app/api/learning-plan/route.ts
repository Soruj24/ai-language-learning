
import { auth } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import User from "@/app/lib/models/User";
import { createLLM } from "@/app/lib/ai/llm-provider";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextResponse } from "next/server";
import { StringOutputParser } from "@langchain/core/output_parsers";

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

  return NextResponse.json({
    learningPlan: user.learningPlan || [],
    learningGoal: user.learningGoal || "General Fluency"
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { goal } = await req.json();

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const llm = createLLM({ temperature: 0.7 });
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an expert language learning curriculum designer.
    Create a 30-day personalized learning plan for a student learning {language} at {level} level.
    Their goal is: "{goal}".
    
    The plan should be structured as a JSON array of objects, where each object represents a day.
    Each day object must have:
    - "day": number (1-30)
    - "title": string (short description of the day's focus)
    - "activities": array of strings (2-3 actionable tasks, e.g., "Learn 10 food words", "Listen to a podcast for 15 mins")
    
    Ensure the difficulty progresses gradually. Include review days every 5-7 days.
    Return ONLY the raw JSON array. Do not include markdown formatting or explanations.`],
    ["human", "Generate the 30-day plan."]
  ]);

  const chain = prompt.pipe(llm).pipe(new StringOutputParser());

  try {
    const result = await chain.invoke({
      language: user.languageLearning || "Spanish",
      level: user.level || "Beginner",
      goal: goal || user.learningGoal || "General Fluency"
    });

    // Clean up the result if it contains markdown code blocks
    const cleanResult = result.replace(/```json/g, "").replace(/```/g, "").trim();
    const plan = JSON.parse(cleanResult);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user.learningPlan = plan.map((day: any) => ({
      ...day,
      completed: false
    }));
    user.learningGoal = goal || user.learningGoal;
    
    // Fix invalid role if present (self-healing)
    if (user.role === 'user') {
      user.role = 'student';
    }

    await user.save();

    return NextResponse.json({ success: true, learningPlan: user.learningPlan });
  } catch (error) {
    console.error("Failed to generate learning plan:", error);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { day, completed } = await req.json();

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.learningPlan) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dayPlan = user.learningPlan.find((p: any) => p.day === day);
    if (dayPlan) {
      dayPlan.completed = completed;
      await user.save();
    }
  }

  return NextResponse.json({ success: true });
}
