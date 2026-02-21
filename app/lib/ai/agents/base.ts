import { createLLM } from "../llm-provider";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { Tool } from "@langchain/core/tools";

// Since we are using Google Gemini, we might need a specific agent type compatible with it.
// Structured Chat Agent is generally good for models that don't support OpenAI functions natively,
// but Gemini does support function calling. However, let's stick to a robust prompt-based approach or use the tool-calling capabilities if available.

// For simplicity and compatibility, we'll use a standard prompt template.

export interface AgentConfig {
  name: string;
  role: string;
  tools: Tool[];
  systemPrompt: string;
}

export async function createAgent({ tools }: AgentConfig) {
  const model = createLLM({
    // Provider defaults will be used
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are the {role}.
    
    System Instructions:
    {systemPrompt}
    
    You have access to the following tools:
    {tools}
    
    Use the following format:
    
    Question: the input question you must answer
    Thought: you should always think about what to do
    Action: the action to take, should be one of [{tool_names}]
    Action Input: the input to the action
    Observation: the result of the action
    ... (this Thought/Action/Action Input/Observation can repeat N times)
    Thought: I now know the final answer
    Final Answer: the final answer to the original input question
    `],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  // We will use the structured chat agent as a fallback if function calling is tricky with this specific version
  // or use createToolCallingAgent if available in this version of LangChain.
  // Given dependencies, let's use createStructuredChatAgent which is versatile.
  
  const agent = await createStructuredChatAgent({
    llm: model,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    verbose: true, // helpful for debugging
    handleParsingErrors: true,
  });

  return executor;
}
