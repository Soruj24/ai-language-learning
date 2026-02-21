'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from '@/app/components/ui/progress';
import { Loader2, BookOpen, CheckCircle, HelpCircle, ArrowRight, Volume2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';

interface VocabularyItem {
  word: string;
  definition: string;
  pronunciation: string;
  example: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface VocabularyResponse {
  type: 'list' | 'quiz';
  topic: string;
  level?: string;
  items?: VocabularyItem[];
  questions?: QuizQuestion[];
}

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const LEVEL_KEYS: Record<string, string> = {
  'Beginner': 'beginner',
  'Intermediate': 'intermediate',
  'Advanced': 'advanced'
};

export default function VocabularyClient() {
  const { t, learningLanguage } = useLanguage();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [mode, setMode] = useState<'list' | 'quiz'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<VocabularyResponse | null>(null);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);

  const generateVocabulary = async () => {
    if (!topic) return;
    
    setIsLoading(true);
    setData(null);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);

    try {
      const prompt = mode === 'list' 
        ? `Generate a vocabulary list for the topic "${topic}" at ${level} level.`
        : `Create a vocabulary quiz for the topic "${topic}" at ${level} level.`;

      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'vocabulary',
          input: prompt,
          learningLanguage: learningLanguage
        }),
      });
      
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to generate vocabulary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return; // Prevent changing answer
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (data?.questions && answer === data.questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (data?.questions && currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('vocabularyBuilder')}</h1>
        <p className="text-muted-foreground">{t('expandVocab')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Controls */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>{t('topic')}</CardTitle>
            <CardDescription>{t('enterTopic')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">{t('topic')}</Label>
              <Input
                id="topic"
                placeholder={t('enterTopic')}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('level')}</Label>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <Badge
                    key={l}
                    variant={level === l ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setLevel(l)}
                  >
                    {t(LEVEL_KEYS[l])}
                  </Badge>
                ))}
              </div>
            </div>

            <Tabs value={mode} onValueChange={(v) => setMode(v as 'list' | 'quiz')}>
              <TabsList className="w-full">
                <TabsTrigger value="list" className="flex-1">{t('generateList')}</TabsTrigger>
                <TabsTrigger value="quiz" className="flex-1">{t('startQuiz')}</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button 
              className="w-full" 
              onClick={generateVocabulary} 
              disabled={isLoading || !topic}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('generating')}
                </>
              ) : (
                mode === 'list' ? t('generateList') : t('startQuiz')
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Area */}
        <Card className="md:col-span-2 min-h-[500px] flex flex-col">
          <CardContent className="flex-1 p-6">
            {!data && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-center p-8">
                <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                <p>{t('enterTopic')}</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="h-8 w-8 mb-4 animate-spin text-primary" />
                <p>{t('generating')}</p>
              </div>
            )}

            {data && data.type === 'list' && data.items && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold capitalize">{data.topic}</h2>
                  <Badge variant="secondary">{data.level}</Badge>
                </div>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {data.items.map((item, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-primary">{item.word}</CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                              <Volume2 className="h-3 w-3 mr-1" />
                              {item.pronunciation}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                          <div>
                            <span className="font-semibold">{t('definition')}: </span>
                            {item.definition}
                          </div>
                          <div className="italic text-muted-foreground">
                            <span className="font-semibold not-italic text-foreground">{t('example')}: </span>
                            &quot;{item.example}&quot;
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {data && data.type === 'quiz' && data.questions && (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold capitalize">{t('quizScore')}: {score}/{data.questions.length}</h2>
                  <Badge variant="secondary">{t('question')} {currentQuestionIndex + 1}/{data.questions.length}</Badge>
                </div>
                
                <Progress value={((currentQuestionIndex) / data.questions.length) * 100} className="w-full" />

                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <h3 className="text-xl font-medium">{data.questions[currentQuestionIndex].question}</h3>
                  
                  <div className="grid gap-3">
                    {data.questions[currentQuestionIndex].options.map((option, index) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = option === data.questions![currentQuestionIndex].correctAnswer;
                      const showCorrect = showExplanation && isCorrect;
                      const showIncorrect = showExplanation && isSelected && !isCorrect;

                      return (
                        <Button
                          key={index}
                          variant={showCorrect ? "default" : showIncorrect ? "destructive" : "outline"}
                          className={`justify-start h-auto py-3 px-4 text-left ${
                            showCorrect ? "bg-green-600 hover:bg-green-700" : ""
                          }`}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={showExplanation}
                        >
                          <div className="flex items-center w-full">
                            <div className="flex-1">{option}</div>
                            {showCorrect && <CheckCircle className="h-5 w-5 ml-2" />}
                            {showIncorrect && <AlertCircle className="h-5 w-5 ml-2" />}
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  {showExplanation && (
                    <div className="bg-muted p-4 rounded-lg mt-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <HelpCircle className="h-4 w-4" />
                        {t('explanation')}
                      </div>
                      <p className="text-sm">{data.questions[currentQuestionIndex].explanation}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={nextQuestion} 
                    disabled={!selectedAnswer || currentQuestionIndex >= data.questions.length - 1}
                  >
                    {currentQuestionIndex < data.questions.length - 1 ? (
                      <>
                        {t('nextQuestion')} <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      t('finishQuiz')
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
