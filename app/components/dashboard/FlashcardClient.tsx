'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { ArrowLeft, CheckCircle, RefreshCw, XCircle, Brain, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/app/components/ui/progress';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  context: string;
  nextReview: string;
  interval: number;
  repetition: number;
  easeFactor: number;
  mistakeCount: number;
}

export default function FlashcardClient() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const res = await fetch('/api/flashcards');
      const data = await res.json();
      if (Array.isArray(data)) {
        setFlashcards(data);
      }
    } catch (error) {
      console.error('Failed to fetch flashcards', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRating = async (quality: number) => {
    const currentCard = flashcards[currentIndex];
    
    try {
      await fetch('/api/flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: currentCard._id,
          quality,
        }),
      });

      if (currentIndex < flashcards.length - 1) {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Failed to update flashcard', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
          <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
          <p className="text-muted-foreground max-w-md">
            You've reviewed all your due flashcards for now. Come back later for more practice.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-6">
          <Brain className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">No flashcards due</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have any flashcards to review right now. Complete more lessons to build your deck!
          </p>
        </div>
        <Link href="/lesson">
          <Button>Start a Lesson</Button>
        </Link>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex) / flashcards.length) * 100;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Spaced Repetition</h1>
            <p className="text-muted-foreground">Review your mistakes</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium">
            {currentIndex + 1} / {flashcards.length}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="perspective-1000 min-h-[400px] relative">
        <div 
            className={`transition-all duration-500 transform-style-3d relative w-full h-full min-h-[400px] cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
            onClick={() => !isFlipped && setIsFlipped(true)}
        >
            {/* Front */}
            <Card className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center border-2 border-primary/20 shadow-xl ${isFlipped ? 'invisible' : 'visible'}`}>
                <div className="text-sm text-muted-foreground uppercase tracking-widest mb-4">Question</div>
                <h3 className="text-3xl font-bold mb-6">{currentCard.front}</h3>
                {currentCard.context && (
                    <div className="text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg italic">
                        Context: {currentCard.context}
                    </div>
                )}
                <p className="absolute bottom-8 text-xs text-muted-foreground animate-pulse">
                    Tap to flip
                </p>
            </Card>

            {/* Back */}
            <Card className={`absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-center border-2 border-green-500/20 shadow-xl bg-slate-900/50 backdrop-blur-sm ${isFlipped ? 'visible' : 'invisible'}`}>
                <div className="text-sm text-muted-foreground uppercase tracking-widest mb-4">Answer</div>
                <div className="prose dark:prose-invert text-lg mb-8 whitespace-pre-wrap">
                    {currentCard.back}
                </div>
            </Card>
        </div>
      </div>

      {isFlipped ? (
        <div className="grid grid-cols-4 gap-4 mt-4">
            <Button 
                variant="outline" 
                className="flex flex-col h-20 gap-1 border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
                onClick={() => handleRating(0)}
            >
                <RotateCcw className="h-5 w-5 mb-1" />
                <span>Again</span>
                <span className="text-[10px] opacity-70">&lt; 1m</span>
            </Button>
            <Button 
                variant="outline" 
                className="flex flex-col h-20 gap-1 border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-500"
                onClick={() => handleRating(3)}
            >
                <div className="font-bold text-lg mb-1">Hard</div>
                <span className="text-[10px] opacity-70">2d</span>
            </Button>
            <Button 
                variant="outline" 
                className="flex flex-col h-20 gap-1 border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-500"
                onClick={() => handleRating(4)}
            >
                <div className="font-bold text-lg mb-1">Good</div>
                <span className="text-[10px] opacity-70">3d</span>
            </Button>
            <Button 
                variant="outline" 
                className="flex flex-col h-20 gap-1 border-green-500/50 hover:bg-green-500/10 hover:text-green-500"
                onClick={() => handleRating(5)}
            >
                <div className="font-bold text-lg mb-1">Easy</div>
                <span className="text-[10px] opacity-70">4d</span>
            </Button>
        </div>
      ) : (
          <Button size="lg" className="w-full mt-4 h-14 text-lg" onClick={() => setIsFlipped(true)}>
            Show Answer
          </Button>
      )}
    </div>
  );
}
