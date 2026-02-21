import { createLLM } from "../llm-provider";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { speechToTextTool, textToSpeechTool } from "../tools/mcp-tools";

const tools = [speechToTextTool, textToSpeechTool];

export async function createConversationAgent(targetLanguage: string = 'Spanish') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _target = targetLanguage; // Suppress unused variable warning while keeping signature
  const llm = createLLM({
    temperature: 0.8,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a Conversation Partner for {targetLanguage}.
  Current Mode: {mode}
  
  Your goal is to simulate natural conversations with the user in {targetLanguage}.
  If the mode is not specified, default to "Casual chat".
  
  Modes:
  - Casual chat: Friendly, informal, slang allowed.
  - Job interview: Professional, formal, ask interview questions.
  - Travel: Helpful, tourist-focused, roleplay as local.
  - Business meeting: Formal, professional, focused on objectives.
  - Daily life: Common scenarios, shopping, family, etc.
  
  When user sends audio:
  - Use speech_to_text to transcribe it.
  - Respond naturally to the content in {targetLanguage}.
  - Use text_to_speech to provide your response as audio if requested or if the input was audio.
  
  When user sends text:
  - Respond conversationally in {targetLanguage}.
  - Ask follow-up questions.
  - Keep the conversation flowing.
  - If the user makes a mistake, correct it gently.
  - Suggest better phrases if appropriate.
  
  Always respond in JSON format with the following structure:
  {{
    "response_text": "Your reply in {targetLanguage}",
    "response_audio_url": "URL if audio was generated, otherwise null",
    "translation": "Translation of your reply in user's interface language (assume English if unknown)",
    "correction": "Correction of user's input if needed (optional)",
    "suggestion": "Better phrase or alternative (optional)",
    "next_question": "A follow-up question to keep the chat going"
  }}
  
  IMPORTANT: Return ONLY the JSON object. Do not add any text before or after the JSON. Do not wrap it in markdown code blocks.
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
