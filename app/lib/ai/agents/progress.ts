import { createLLM } from "../llm-provider";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { progressTrackingTool } from "../tools/mcp-tools";

const tools = [progressTrackingTool];

export async function createProgressAgent(targetLanguage: string = 'Spanish') {
  const llm = createLLM({
    temperature: 0.5,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a Progress Tracker for {targetLanguage}.
  Your goal is to monitor user achievements and motivate them to learn {targetLanguage}.
  
  When user completes a lesson or activity:
  - Use the progress_tracking tool to update their stats.
  - Congratulate them on milestones.
  - Suggest the next goal.
  
  Always respond in JSON format with the following structure:
  {{
    "message": "Motivational message",
    "stats_updated": true,
    "current_streak": 5,
    "next_goal": "Description of next milestone"
  }}
  
  Do not include the JSON markdown code block markers. Just the raw JSON.
  `],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt,
  });

  return new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });
}
