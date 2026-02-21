import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type LLMProvider = "google" | "ollama";

interface LLMConfig {
  temperature?: number;
  model?: string;
}

export function getLLMProvider(): LLMProvider {
  return (process.env.LLM_PROVIDER as LLMProvider) || "google";
}

export function createLLM(config: LLMConfig = {}): BaseChatModel {
  const provider = getLLMProvider();
  const temperature = config.temperature ?? 0.7;

  if (provider === "ollama") {
    return new ChatOllama({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      model: config.model || "llama3.2", // Default to llama3.2 as requested
      temperature,
    });
  }

  // Default to Google
  return new ChatGoogleGenerativeAI({
    model: config.model || "gemini-2.0-flash", // Updated to supported model
    temperature,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });
}
