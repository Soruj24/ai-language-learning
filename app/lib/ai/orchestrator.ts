import { createTutorAgent } from "./agents/tutor";
import { createPronunciationAgent } from "./agents/pronunciation";
import { createGrammarAgent } from "./agents/grammar";
import { createConversationAgent } from "./agents/conversation";
import { createProgressAgent } from "./agents/progress";
import { createLessonGeneratorAgent } from "./agents/lesson-generator";
import { createVocabularyAgent } from "./agents/vocabulary";

export type AgentType = "tutor" | "pronunciation" | "grammar" | "conversation" | "progress" | "lesson-generator" | "vocabulary";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processUserRequest(agentType: AgentType, input: any, targetLanguage: string = 'Spanish') {
  let executor;

  switch (agentType) {
    case "tutor":
      executor = await createTutorAgent(targetLanguage);
      break;
    case "pronunciation":
      executor = await createPronunciationAgent(targetLanguage);
      break;
    case "grammar":
      executor = await createGrammarAgent(targetLanguage);
      break;
    case "conversation":
      executor = await createConversationAgent(targetLanguage);
      break;
    case "progress":
      executor = await createProgressAgent(targetLanguage);
      break;
    case "lesson-generator":
      executor = await createLessonGeneratorAgent(targetLanguage);
      break;
    case "vocabulary":
      executor = await createVocabularyAgent(targetLanguage);
      break;
    default:
      throw new Error(`Unknown agent type: ${agentType}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let invokePayload: any = { targetLanguage };
  if (typeof input === 'string') {
    invokePayload.input = input;
    if (agentType === 'conversation') {
      invokePayload.mode = "Casual chat";
    }
  } else {
    // input is object
    if (agentType === 'conversation') {
      invokePayload = {
        input: input.input || input.text,
        mode: input.mode || "Casual chat",
        targetLanguage
      };
    } else {
      // for other agents, extract text
      invokePayload = { 
        input: input.input || input.text || JSON.stringify(input),
        targetLanguage
      };
    }
  }

  const result = await executor.invoke(invokePayload);
  
  // Attempt to parse JSON response if the agent followed instructions
  try {
    let jsonString = result.output.replace(/```json\n?|\n?```/g, "").trim();
    const firstBrace = jsonString.indexOf("{");
    const lastBrace = jsonString.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
        jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }
    return JSON.parse(jsonString);
  } catch {
    // Fallback if not valid JSON
    console.warn("Agent did not return valid JSON:", result.output);
    return {
      raw_response: result.output,
      error: "Failed to parse JSON response"
    };
  }
}
