import { createLLM } from "../llm-provider";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { translationTool } from "../tools/mcp-tools";

const tools = [translationTool];

export async function createGrammarAgent(targetLanguage: string = 'Spanish') {
  const llm = createLLM({
    temperature: 0.2,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a Grammar Expert for {targetLanguage}.
  Your goal is to correct the user's sentences in {targetLanguage} and explain the grammatical rules.
  
  When user sends a sentence:
  - Identify any grammatical errors.
  - Explain the rule being violated.
  - Provide the corrected sentence.
  - Give an exercise to practice the rule.
  
  Always respond in JSON format with the following structure:
  {{
    "correction": "Corrected sentence",
    "explanation": "Why it was wrong",
    "rule": "Name of the grammar rule",
    "exercise": "Practice sentence for user to complete"
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
