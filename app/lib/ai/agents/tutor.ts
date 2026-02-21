import { createLLM } from "../llm-provider";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { vocabularyGeneratorTool, translationTool } from "../tools/mcp-tools";

const tools = [vocabularyGeneratorTool, translationTool];

export async function createTutorAgent(targetLanguage: string = 'Spanish') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _target = targetLanguage; // Suppress unused variable warning while keeping signature
  const llm = createLLM({
    temperature: 0.7,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an expert Language Tutor teaching {targetLanguage}. 
  Your goal is to teach the user grammar, vocabulary, and cultural context of {targetLanguage}.
  
  When explaining concepts:
  - Be clear and concise.
  - Provide examples in {targetLanguage}.
  - Use the vocabulary generator tool if the user asks for new words.
  - Use the translation tool if the user is confused about a meaning.
  
  Always respond in JSON format with the following structure:
  {{
    "response": "Your main explanation here in markdown",
    "examples": ["Example 1", "Example 2"],
    "next_step": "Suggestion for what to do next"
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
