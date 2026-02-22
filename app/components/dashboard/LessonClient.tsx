"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  Send,
  Mic,
  ArrowLeft,
  Lightbulb,
  Sparkles,
  WifiOff,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useOffline } from "@/app/lib/hooks/use-offline";
import { useSync } from "@/app/lib/hooks/use-sync";
import InteractiveLessonView from "./InteractiveLessonView";
import { LessonPlan } from "@/app/lib/types/lesson";

interface LessonClientProps {
  id: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  examples?: string[];
  nextStep?: string;
}

export default function LessonClient({ id }: LessonClientProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [config, setConfig] = useState({
    topic: id !== "new" ? id : "",
    level: "Beginner",
    language: "Spanish", // Default, could be dynamic
  });
  const [mode, setMode] = useState<"setup" | "plan" | "chat">("setup");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isOffline = useOffline();
  const { saveProgress } = useSync();
  const [isSaved, setIsSaved] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isCompleted, setIsCompleted] = useState(false);

  const handleExerciseResult = async (
    isCorrect: boolean,
    question: string,
    answer: string,
    explanation: string
  ) => {
    if (!isCorrect) {
      // Save to flashcards
      try {
        await fetch("/api/flashcards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            front: question,
            back: `${answer}\n\n${explanation}`,
            context: `Lesson: ${lessonPlan?.title || "Unknown"}`,
          }),
        });
      } catch (e) {
        console.error("Failed to save flashcard", e);
      }
    }
  };

  useEffect(() => {
    if (id !== "new") {
      const saved = localStorage.getItem(`lesson_${id}`);
      if (saved) {
        setIsSaved(true);
        if (isOffline && !lessonPlan) {
          try {
            const parsed = JSON.parse(saved);
            setLessonPlan(parsed);
            setMode("plan");
            // setStarted(true);
          } catch (e) {
            console.error("Failed to load offline lesson", e);
          }
        }
      }
      if (localStorage.getItem(`completed_${id}`)) {
        setIsCompleted(true);
      }
    }
  }, [id, isOffline, lessonPlan]);

  const saveOffline = () => {
    if (lessonPlan) {
      localStorage.setItem(`lesson_${id}`, JSON.stringify(lessonPlan));
      setIsSaved(true);
    }
  };

  const handleComplete = (score: number) => {
    saveProgress({
      lessonId: id,
      score: (score / (lessonPlan?.quiz.length || 1)) * 100,
      completedAt: new Date().toISOString(),
    });
    setIsCompleted(true);
    localStorage.setItem(`completed_${id}`, "true");
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateLesson = async () => {
    if (isOffline) {
      const saved = localStorage.getItem(`lesson_${id}`);
      if (saved) {
        setLessonPlan(JSON.parse(saved));
        setMode("plan");
        return;
      }
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "lesson-generator",
          input: `Language: ${config.language}, Level: ${config.level}, Topic: ${config.topic}`,
          learningLanguage: config.language,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setLessonPlan(data);
      setMode("plan");
    } catch (error) {
      console.error("Error generating lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startPractice = async () => {
    setMode("chat");
    setIsLoading(true);

    // Initial prompt with lesson context
    const contextPrompt = `I have just studied a lesson titled "${lessonPlan?.title}".
    
    Key vocabulary: ${lessonPlan?.vocabulary.map((v) => v.word).join(", ")}.
    Grammar rules: ${lessonPlan?.grammar_rules.map((g) => g.rule).join(", ")}.
    
    Please act as my teacher and guide me through an interactive practice session based on this lesson.
    Start by asking me a question to test my understanding or practice a scenario.`;

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "tutor",
          input: contextPrompt,
          learningLanguage: config.language,
        }),
      });

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Welcome to the practice session!",
        examples: data.examples,
        nextStep: data.next_step,
      };
      setMessages([aiMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent: "tutor",
          input: text,
          learningLanguage: config.language,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I didn't understand that.",
        examples: data.examples,
        nextStep: data.next_step,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
  };

  if (mode === "setup") {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/lesson">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">New Lesson</h1>
            <p className="text-muted-foreground">
              Create a custom learning path
            </p>
          </div>
        </div>

        <Card className="max-w-md mx-auto w-full">
          <CardHeader>
            <CardTitle>Lesson Configuration</CardTitle>
            <CardDescription>
              Customize your learning experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Input
                value={config.topic}
                onChange={(e) =>
                  setConfig({ ...config, topic: e.target.value })
                }
                placeholder="e.g., Ordering Food, Business Meeting"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Level</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={config.level}
                onChange={(e) =>
                  setConfig({ ...config, level: e.target.value })
                }
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={config.language}
                onChange={(e) =>
                  setConfig({ ...config, language: e.target.value })
                }
              >
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Italian">Italian</option>
                <option value="Japanese">Japanese</option>
                <option value="Chinese">Chinese</option>
                <option value="Bangla">Bangla</option>
                <option value="English">English</option>
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={generateLesson}
              disabled={isLoading || !config.topic}
            >
              {isLoading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Lesson...
                </>
              ) : (
                <>
                  {isOffline ? (
                    <WifiOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isOffline ? "Load Offline Lesson" : "Generate Lesson"}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (mode === "plan" && lessonPlan) {
    return (
      <InteractiveLessonView
        lesson={lessonPlan}
        onComplete={handleComplete}
        onExit={() => setMode("setup")}
        onStartAiPractice={() => !isOffline && startPractice()}
        onSave={saveOffline}
        isSaved={isSaved}
        onExerciseAnswer={(isCorrect, q, a, e) =>
          handleExerciseResult(isCorrect, q, a, e)
        }
      />
    );
  }

  // Chat Mode
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setMode("plan")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {lessonPlan?.title || `Lesson ${id}`}
            </h1>
            <p className="text-xs text-muted-foreground">
              Interactive Practice
            </p>
          </div>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 p-0 overflow-hidden relative">
          <ScrollArea ref={scrollAreaRef} className="h-full p-4">
            <div className="flex flex-col gap-6 pb-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col gap-2 max-w-[85%] ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-5 py-4 ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        {m.content.split("\n").map((line, i) => (
                          <p key={i} className="mb-1 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>

                    {m.role === "assistant" && (
                      <div className="flex flex-col gap-2 w-full">
                        {m.examples && m.examples.length > 0 && (
                          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg p-3">
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> Examples:
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              {m.examples.map((ex, i) => (
                                <li key={i}>{ex}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {m.nextStep && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg">
                            <Lightbulb className="h-3 w-3 text-yellow-500" />
                            <span>Suggestion: {m.nextStep}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 text-muted-foreground text-sm flex items-center gap-2">
                    <div className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce" />
                    <div className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce delay-75" />
                    <div className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Button type="button" variant="outline" size="icon">
              <Mic className="h-4 w-4" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
