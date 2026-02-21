import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type LLMProvider = "google" | "ollama";

interface LLMConfig {
  temperature?: number;
  model?: string;
}

export function getLLMProvider(): LLMProvider {
  return (process.env.LLM_PROVIDER as LLMProvider) || "ollama";
}

export function createLLM(config: LLMConfig = {}): BaseChatModel {
  // const provider = getLLMProvider();
  const temperature = config.temperature ?? 0.7;

  // Default to Ollama (llama3.2)
  return new ChatOllama({
    baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    model: config.model || "llama3.2",
    temperature,
  });
}
