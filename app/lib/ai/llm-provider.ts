import { ChatOllama } from "@langchain/ollama";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type LLMProvider = "google" | "ollama";

interface LLMConfig {
  temperature?: number;
  model?: string;
}

export function getLLMProvider(): LLMProvider {
  if (process.env.LLM_PROVIDER) {
    return process.env.LLM_PROVIDER as LLMProvider;
  }
  if (process.env.GOOGLE_API_KEY) {
    return "google";
  }
  return "ollama";
}

export function createLLM(config: LLMConfig = {}): BaseChatModel {
  const provider = getLLMProvider();
  const temperature = config.temperature ?? 0.7;

  if (provider === "google") {
    return new ChatGoogleGenerativeAI({
      modelName: config.model || "gemini-1.5-flash",
      maxOutputTokens: 2048,
      temperature,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  // Default to Ollama (llama3.2)
  return new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: config.model || "llama3.2",
    temperature,
  });
}
