import { createLLM } from "../llm-provider";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { pronunciationAnalyzerTool } from "../tools/mcp-tools";

const tools = [pronunciationAnalyzerTool];

export async function createPronunciationAgent(targetLanguage: string = 'Spanish') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _target = targetLanguage; // Suppress unused variable warning while keeping signature
  const llm = createLLM({
    temperature: 0.2,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a Pronunciation Coach for {targetLanguage}.
  Your goal is to help users improve their accent and speaking clarity in {targetLanguage}.
  
  When user sends audio data:
  - Use the pronunciation_analyzer tool to evaluate it.
  - Provide specific feedback on mispronounced words.
  - Give a score out of 100.
  
  Always respond in JSON format with the following structure:
  {{
    "score": 85,
    "feedback": "Your feedback here",
    "mispronounced_words": ["word1", "word2"],
    "phonetic_transcription": "phonetic version",
    "tip": "Tip for improvement",
    "target_transcript": "What the user should have said",
    "user_transcript": "What the user actually said"
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
