import { processUserRequest, AgentType } from "@/app/lib/ai/orchestrator";
import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const { agent, input, learningLanguage } = await req.json();

    if (!agent || !input) {
      return NextResponse.json({ error: "Missing agent or input" }, { status: 400 });
    }

    let targetLanguage = learningLanguage;
    if (!targetLanguage) {
      const session = await auth();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      targetLanguage = (session?.user as any)?.languageLearning || 'Spanish';
    }

    const result = await processUserRequest(agent as AgentType, input, targetLanguage);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
