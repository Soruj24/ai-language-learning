import { createLLM } from "../llm-provider";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import {  translationTool } from "../tools/mcp-tools";

const tools = [translationTool];

export async function createLessonGeneratorAgent(targetLanguage: string = 'Spanish') {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _target = targetLanguage; // Suppress unused variable warning while keeping signature
  const llm = createLLM({
    temperature: 0.5,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an expert Language Curriculum Designer for {targetLanguage}.
  Your goal is to create dynamic, short, interactive, and progressive language lessons for {targetLanguage}.
  
  When the user provides a topic and level, generate a structured lesson plan for {targetLanguage}.
  
  Input:
  - Level (e.g., Beginner, Intermediate)
  - Topic (e.g., Greetings, Travel, Food)
  
  Output Format (JSON):
  {{
    "title": "Lesson Title",
    "level": "Level (e.g., Beginner)",
    "topic": "Topic (e.g., Greetings)",
    "introduction": "Brief introduction to the lesson",
    "vocabulary": [
      {{ "word": "Word", "translation": "Translation", "example": "Example sentence" }}
    ],
    "grammar_rules": [
      {{ "rule": "Rule name", "explanation": "Explanation", "example": "Example usage" }}
    ],
    "examples": [
      {{ "scenario": "Scenario description", "dialogue": ["Speaker A: ...", "Speaker B: ..."] }}
    ],
    "exercises": [
      {{ "question": "Question text", "options": ["Option A", "Option B", "Option C"], "correct_answer": "Option A", "explanation": "Why it is correct" }}
    ],
    "quiz": [
       {{ "question": "Quiz Question", "options": ["Option A", "Option B", "Option C"], "answer": "Option A" }}
    ]
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
