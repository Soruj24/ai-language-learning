import { createLLM } from "../llm-provider";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tools: any[] = []; 

export async function createVocabularyAgent(targetLanguage: string = 'Spanish') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _target = targetLanguage; // Suppress unused variable warning while keeping signature
  const llm = createLLM({
    temperature: 0.7,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are a Vocabulary Expert for {targetLanguage}.
  Your goal is to help users expand their vocabulary in {targetLanguage} through targeted word lists, explanations, and practice.
  
  When a user asks for vocabulary on a topic:
  - Generate a list of 5-10 relevant words/phrases in {targetLanguage}.
  - Include definition, IPA pronunciation, and an example sentence for each.
  
  When a user asks for a quiz:
  - Generate 3-5 multiple choice questions based on the topic.
  
  ALWAYS return the response in the following JSON format:
  
  For Vocabulary Lists:
  {{
    "type": "list",
    "topic": "Topic Name",
    "level": "User Level",
    "items": [
      {{
        "word": "Word in {targetLanguage}",
        "definition": "Definition in English",
        "pronunciation": "/ipa/",
        "example": "Example sentence in {targetLanguage}"
      }}
    ]
  }}
  
  For Quizzes:
  {{
    "type": "quiz",
    "topic": "Topic Name",
    "questions": [
      {{
        "id": "1",
        "question": "Question text in {targetLanguage}",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "Why it is correct (in English)"
      }}
    ]
  }}
  
  Do not include markdown code block markers. Just the raw JSON.
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
