import { z } from "zod";
import { createLLM } from "./llm-provider";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";

// 1. Lesson Chain
const lessonSchema = z.object({
  title: z.string().describe("The title of the lesson"),
  introduction: z.string().describe("A brief introduction to the topic"),
  vocabulary: z
    .array(
      z.object({
        word: z.string(),
        translation: z.string(),
        example: z.string(),
        pronunciation: z.string().optional(),
      }),
    )
    .describe("List of vocabulary words"),
  grammarRules: z
    .array(
      z.object({
        rule: z.string(),
        explanation: z.string(),
        example: z.string(),
      }),
    )
    .describe("Grammar rules explained in the lesson"),
  examples: z
    .array(
      z.object({
        sentence: z.string(),
        translation: z.string(),
      }),
    )
    .describe("Example sentences using the vocabulary and grammar"),
  exercises: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
      }),
    )
    .describe("Multiple choice exercises"),
  quiz: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()),
        correctAnswer: z.string(),
      }),
    )
    .describe("Quiz questions"),
});

export const createLessonChain = () => {
  const llm = createLLM({ temperature: 0.7 });
  const parser = StructuredOutputParser.fromZodSchema(lessonSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert language teacher. Create a structured lesson plan based on the user's request.\n{format_instructions}",
    ],
    ["human", "Language: {language}\nLevel: {level}\nTopic: {topic}"],
  ]);

  return RunnableSequence.from([prompt, llm, parser]);
};

// 2. Conversation Chain
const conversationSchema = z.object({
  response: z.string().describe("The natural response to the user"),
  corrections: z
    .array(
      z.object({
        original: z.string(),
        correction: z.string(),
        explanation: z.string(),
      }),
    )
    .optional()
    .describe("Corrections for any mistakes in the user's message"),
  translation: z.string().optional().describe("Translation of the response"),
});

export const createConversationChain = () => {
  const llm = createLLM({ temperature: 0.7 });
  const parser = StructuredOutputParser.fromZodSchema(conversationSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a helpful language conversation partner. Engage in a natural conversation. If the user makes mistakes, provide corrections gently.\n{format_instructions}",
    ],
    new MessagesPlaceholder("history"),
    ["human", "{message}"],
  ]);

  return RunnableSequence.from([
    {
      history: (input: { history: BaseMessage[]; message: string }) => input.history,
      message: (input: { history: BaseMessage[]; message: string }) => input.message,
      format_instructions: () => parser.getFormatInstructions(),
    },
    prompt,
    llm,
    parser,
  ]);
};

// 3. Grammar Chain
const grammarSchema = z.object({
  correctedSentence: z
    .string()
    .describe("The corrected version of the user's sentence"),
  explanation: z
    .string()
    .describe("Detailed grammatical explanation of the errors and corrections"),
  rule: z.string().describe("The specific grammar rule that applies"),
  examples: z
    .array(z.string())
    .describe("Additional examples of correct usage"),
});

export const createGrammarChain = () => {
  const llm = createLLM({ temperature: 0.2 });
  const parser = StructuredOutputParser.fromZodSchema(grammarSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a grammar expert. Analyze the user's sentence, correct it, and explain the grammar rules.\n{format_instructions}",
    ],
    ["human", "Sentence: {sentence}"],
  ]);

  return RunnableSequence.from([prompt, llm, parser]);
};

// 4. Pronunciation Chain
const pronunciationSchema = z.object({
  score: z.number().describe("Pronunciation score out of 100"),
  feedback: z.string().describe("Specific feedback on pronunciation"),
  mispronouncedWords: z
    .array(z.string())
    .describe("List of words that were mispronounced"),
  tips: z.array(z.string()).describe("Tips to improve pronunciation"),
});

export const createPronunciationChain = () => {
  const llm = createLLM({ temperature: 0.2 });
  const parser = StructuredOutputParser.fromZodSchema(pronunciationSchema);

  const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are a pronunciation coach. Analyze the user's speech text and provided phoneme analysis (if any) to give feedback.\n{format_instructions}",
    ],
    ["human", "Text: {text}\nPhoneme Analysis/Context: {analysis}"],
  ]);

  return RunnableSequence.from([prompt, llm, parser]);
};
