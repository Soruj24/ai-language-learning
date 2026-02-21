"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  ChevronLeft, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  Trophy,
  ArrowRight,
  BookOpen,
  Brain,
  MessageSquare,
  Download
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/lib/utils";
import { LessonPlan } from "@/app/lib/types/lesson";

interface InteractiveLessonViewProps {
  lesson: LessonPlan;
  onComplete?: (score: number) => void;
  onExit?: () => void;
  onStartAiPractice?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  onExerciseAnswer?: (isCorrect: boolean, question: string, answer: string, explanation: string) => void;
}

export default function InteractiveLessonView({ lesson, onComplete, onExit, onStartAiPractice, onSave, isSaved, onExerciseAnswer }: InteractiveLessonViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [score, setScore] = useState(0);

  // Define steps
  const steps = [
    { id: "intro", title: "Introduction", icon: BookOpen },
    { id: "vocab", title: "Vocabulary", icon: BookOpen },
    { id: "grammar", title: "Grammar", icon: Brain },
    { id: "examples", title: "Examples", icon: MessageSquare },
    { id: "practice", title: "Practice", icon: CheckCircle },
    { id: "quiz", title: "Quiz", icon: Trophy },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // Calculate score
    let correct = 0;
    lesson.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) correct++;
    });
    setScore(correct);
    setShowQuizResult(true);
    if (onComplete) onComplete(correct);
  };

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to detect language based on text or lesson context (defaulting to lesson language if available)
    // For now, let's assume English or detect automatically
    window.speechSynthesis.speak(utterance);
  };

  const renderContent = () => {
    switch (steps[currentStep].id) {
      case "intro":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <Badge variant="outline" className="px-4 py-1 text-lg border-primary/20 bg-primary/5 text-primary">
                {lesson.level || "Beginner"}
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{lesson.title}</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{lesson.topic}</p>
            </div>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10">
              <CardContent className="pt-6">
                <p className="text-lg leading-relaxed">{lesson.introduction}</p>
              </CardContent>
            </Card>
          </div>
        );

      case "vocab":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-4">Vocabulary</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {lesson.vocabulary.map((item, idx) => (
                <Card key={idx} className="group hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{item.word}</h3>
                      <p className="text-muted-foreground">{item.translation}</p>
                      {item.example && (
                        <p className="text-sm text-muted-foreground/80 mt-1 italic">"{item.example}"</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => playAudio(item.word)}
                    >
                      <Volume2 className="h-5 w-5 text-primary" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "grammar":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-4">Grammar Rules</h2>
            <div className="space-y-4">
              {lesson.grammar_rules.map((rule, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-lg">{rule.rule}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p>{rule.explanation}</p>
                    <div className="bg-muted p-3 rounded-md text-sm font-mono">
                      {rule.example}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "examples":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-4">Example Scenarios</h2>
            <div className="grid gap-6">
              {lesson.examples.map((example, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-base text-muted-foreground uppercase tracking-wider text-xs">
                      {example.scenario}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {example.dialogue.map((line, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-1 h-full min-h-[24px] bg-primary/20 rounded-full" />
                        <p className="text-lg">{line}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "practice":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-4">Practice Exercises</h2>
            <div className="space-y-8">
              {lesson.exercises.map((exercise, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Question {idx + 1}</CardTitle>
                    <CardDescription className="text-base text-foreground/90">{exercise.question}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={exerciseAnswers[idx]}
                      onValueChange={(val) => {
                        setExerciseAnswers(prev => ({ ...prev, [idx]: val }));
                        if (onExerciseAnswer) {
                          const isCorrect = val === exercise.correct_answer;
                          onExerciseAnswer(isCorrect, exercise.question, exercise.correct_answer, exercise.explanation);
                        }
                      }}
                      className="grid gap-3"
                    >
                      {exercise.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`ex-${idx}-opt-${optIdx}`} className="peer sr-only" />
                          <Label
                            htmlFor={`ex-${idx}-opt-${optIdx}`}
                            className={cn(
                              "flex flex-1 items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                              exerciseAnswers[idx] === option ? "border-primary bg-primary/5" : ""
                            )}
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {exerciseAnswers[idx] && (
                      <div className={cn(
                        "mt-4 p-3 rounded-md flex items-center gap-2",
                        exerciseAnswers[idx] === exercise.correct_answer 
                          ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                          : "bg-red-500/10 text-red-600 dark:text-red-400"
                      )}>
                        {exerciseAnswers[idx] === exercise.correct_answer ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        <div>
                          <p className="font-medium">
                            {exerciseAnswers[idx] === exercise.correct_answer ? "Correct!" : "Incorrect"}
                          </p>
                          <p className="text-sm opacity-90">{exercise.explanation}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "quiz":
        if (showQuizResult) {
          return (
            <div className="text-center space-y-8 animate-in zoom-in duration-500">
              <div className="relative inline-block">
                <Trophy className="h-32 w-32 text-yellow-500 mx-auto" />
                <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl shadow-lg">
                  {Math.round((score / lesson.quiz.length) * 100)}%
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold">Lesson Complete!</h2>
                <p className="text-xl text-muted-foreground mt-2">
                  You got {score} out of {lesson.quiz.length} questions correct.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={onExit}>Back to Dashboard</Button>
                <Button onClick={() => window.location.reload()}>Retake Lesson</Button>
                {onStartAiPractice && (
                  <Button onClick={onStartAiPractice} variant="secondary">
                    Practice with AI Tutor
                  </Button>
                )}
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold mb-4">Final Quiz</h2>
            <div className="space-y-8">
              {lesson.quiz.map((q, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                    <CardDescription className="text-base text-foreground/90">{q.question}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={quizAnswers[idx]}
                      onValueChange={(val) => setQuizAnswers(prev => ({ ...prev, [idx]: val }))}
                      className="grid gap-3"
                    >
                      {q.options?.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`quiz-${idx}-opt-${optIdx}`} className="peer sr-only" />
                          <Label
                            htmlFor={`quiz-${idx}-opt-${optIdx}`}
                            className={cn(
                              "flex flex-1 items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                              quizAnswers[idx] === option ? "border-primary bg-primary/5" : ""
                            )}
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full">
      {/* Header */}
      <header className="flex-none py-6 space-y-4 px-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onExit} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">{steps[currentStep].title}</span>
          </div>
          <div className="flex items-center gap-4">
            {onSave && (
              <Button variant="ghost" size="sm" onClick={onSave} disabled={isSaved} className="gap-2">
                {isSaved ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Saved</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Save Offline</span>
                  </>
                )}
              </Button>
            )}
            <span>Step {currentStep + 1} of {steps.length}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </header>

      {/* Main Content */}
      <ScrollArea className="flex-1 px-4 pb-10">
        <div className="max-w-3xl mx-auto pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer Navigation */}
      {!showQuizResult && (
        <div className="flex-none p-4 border-t bg-background/80 backdrop-blur-sm">
          <div className="flex justify-between max-w-3xl mx-auto w-full">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            
            <Button 
              onClick={handleNext} 
              className="gap-2"
              disabled={
                (steps[currentStep].id === 'quiz' && Object.keys(quizAnswers).length < lesson.quiz.length)
              }
            >
              {currentStep === steps.length - 1 ? (
                <>Finish Lesson <CheckCircle className="h-4 w-4" /></>
              ) : (
                <>Next Step <ChevronRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
