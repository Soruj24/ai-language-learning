
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { CheckCircle, Circle, RefreshCw, Target, Brain, X } from 'lucide-react';
import { Input } from '@/app/components/ui/input';

interface DayPlan {
  day: number;
  title: string;
  activities: string[];
  completed: boolean;
}

export default function LearningPlanClient() {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchPlan();
  }, []);

  const fetchPlan = async () => {
    try {
      const res = await fetch('/api/learning-plan');
      const data = await res.json();
      if (data.learningPlan) {
        setPlan(data.learningPlan);
      }
      if (data.learningGoal) {
        setGoal(data.learningGoal);
      }
    } catch (error) {
      console.error('Failed to fetch plan', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlan = async (newGoal: string) => {
    setIsGenerating(true);
    setMessage(null);
    try {
      const res = await fetch('/api/learning-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: newGoal }),
      });
      const data = await res.json();
      if (data.success) {
        setPlan(data.learningPlan);
        setGoal(newGoal);
        setShowModal(false);
        setMessage({ type: 'success', text: 'Plan Generated Successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to generate plan.' });
      }
    } catch (error) {
      console.error('Failed to generate plan', error);
      setMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleDay = async (day: number, currentStatus: boolean) => {
    // Optimistic update
    setPlan(prev => prev.map(p => p.day === day ? { ...p, completed: !currentStatus } : p));

    try {
      await fetch('/api/learning-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, completed: !currentStatus }),
      });
    } catch (error) {
      console.error('Failed to update progress', error);
      // Revert on error
      setPlan(prev => prev.map(p => p.day === day ? { ...p, completed: currentStatus } : p));
    }
  };

  const completedDays = plan.filter(p => p.completed).length;
  const progress = plan.length > 0 ? (completedDays / plan.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full p-4 relative">
      {message && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {message.text}
          <button onClick={() => setMessage(null)} className="ml-2 font-bold">&times;</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalized Learning Plan</h1>
          <p className="text-muted-foreground">Your 30-day roadmap to fluency</p>
        </div>
        
        <Button onClick={() => setShowModal(true)}>
          <Target className="mr-2 h-4 w-4" />
          {plan.length > 0 ? 'Regenerate Plan' : 'Create Plan'}
        </Button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md relative">
            <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setShowModal(false)}>
              <X className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle>Set Your Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                What do you want to achieve in the next 30 days?
              </p>
              <Input 
                placeholder="e.g., Master basic conversation for travel" 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)} 
              />
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={() => generatePlan(goal)} disabled={isGenerating || !goal.trim()}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Plan'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {plan.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10 text-primary">
              <Brain className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-semibold">No plan active</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Set a learning goal to generate a personalized 30-day curriculum tailored to your level.
            </p>
            <Button onClick={() => setShowModal(true)}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Goal: {goal}</span>
                <span className="text-sm font-normal text-muted-foreground">{completedDays} / {plan.length} days</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.map((day) => (
              <Card key={day.day} className={`transition-all hover:shadow-md ${day.completed ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded">
                      Day {day.day}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 rounded-full ${day.completed ? 'text-green-500 hover:text-green-600' : 'text-muted-foreground hover:text-primary'}`}
                      onClick={() => toggleDay(day.day, day.completed)}
                    >
                      {day.completed ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </Button>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-1" title={day.title}>
                    {day.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {day.activities.map((activity, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                        <span className={day.completed ? 'line-through opacity-70' : ''}>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
