import { createOpenAI } from '@ai-sdk/openai';
import { LanguageModel } from 'ai';

export function getAIModel(): LanguageModel {
  // const provider = process.env.LLM_PROVIDER || 'ollama';

  // Configure Ollama using OpenAI compatibility layer
  const ollama = createOpenAI({
    baseURL: (process.env.OLLAMA_BASE_URL || 'http://localhost:11434') + '/v1',
    apiKey: 'ollama', // Required but ignored by Ollama
  });

  const modelName = process.env.OLLAMA_MODEL || 'llama3.2';
  return ollama(modelName);
}
