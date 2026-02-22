'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, 
  Mic, 
  Bot, 
  User, 
  MoreHorizontal, 
  Languages, 
  Briefcase, 
  Plane, 
  Coffee, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  History,
  Plus,
  Globe
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { cn } from '@/app/lib/utils';
import { useLanguage } from '@/app/lib/i18n/LanguageContext';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  corrections?: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  translation?: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  date: Date;
  preview: string;
}

const MODES = [
  { id: 'casual', label: 'Casual Chat', icon: Coffee, color: 'text-orange-500' },
  { id: 'business', label: 'Business', icon: Briefcase, color: 'text-blue-500' },
  { id: 'travel', label: 'Travel', icon: Plane, color: 'text-green-500' },
];

interface ConversationClientProps {
  isPremium: boolean;
}

export default function ConversationClient({ isPremium }: ConversationClientProps) {
  const { learningLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState('casual');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/conversation');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const loadSession = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/conversation/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSessionId(data._id);
        setSelectedMode(data.mode);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMessages(data.messages.map((m: any) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          corrections: m.corrections,
          translation: m.translation,
          timestamp: new Date(m.createdAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = () => {
    setSessionId(null);
    setMessages([]);
    setSelectedMode('casual');
  };

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId: sessionId,
          mode: selectedMode,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const data = await response.json();
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        fetchHistory(); // Refresh history list
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        corrections: data.corrections,
        translation: data.translation,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Card className="w-full max-w-md text-center border-yellow-500/50 shadow-xl bg-gradient-to-b from-background to-yellow-50/10">
          <CardHeader>
            <div className="mx-auto bg-gradient-to-br from-yellow-400 to-amber-600 p-4 rounded-full mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Premium Feature Locked</CardTitle>
            <CardDescription>
              The AI Tutor is available exclusively for Premium members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Unlock unlimited 1-on-1 conversations with our advanced AI tutor, complete with real-time corrections and role-play scenarios.
            </p>
            <ul className="text-left space-y-3 mb-6 text-sm">
              <li className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full"><Bot className="w-4 h-4 text-green-600" /></div>
                <span>Unlimited AI conversations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full"><Briefcase className="w-4 h-4 text-blue-600" /></div>
                <span>Business & Travel scenarios</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full"><Languages className="w-4 h-4 text-purple-600" /></div>
                <span>Instant grammar corrections</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/billing" className="w-full">
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white border-0" size="lg">
                Get Premium
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background border rounded-lg shadow-sm">
      {/* Sidebar */}
      <motion.div 
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 0 }}
        className="border-r bg-muted/30 hidden md:flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <History className="w-4 h-4" /> History
          </h2>
          <Button variant="ghost" size="icon" onClick={startNewSession}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {sessions.map((session) => (
              <Button 
                key={session.id} 
                variant={sessionId === session.id ? "secondary" : "ghost"} 
                className="w-full justify-start text-left h-auto py-3 px-3"
                onClick={() => loadSession(session.id)}
              >
                <div className="overflow-hidden">
                  <div className="font-medium truncate">{session.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{session.preview}</div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background/50">
          <div className="text-xs font-medium text-muted-foreground mb-2">MODE</div>
          <div className="space-y-1">
            {MODES.map((mode) => (
              <Button 
                key={mode.id}
                variant={selectedMode === mode.id ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setSelectedMode(mode.id)}
              >
                <mode.icon className={cn("w-4 h-4", mode.color)} />
                {mode.label}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Tutor</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground capitalize">{selectedMode} Mode</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex">
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </header>

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[40vh] text-center text-muted-foreground space-y-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Start a conversation</h3>
                <p className="max-w-md">
                  Practice your {learningLanguage} skills with our AI tutor. Ask questions, role-play scenarios, or just chat!
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setInput("How do I say 'Hello'?")}>
                    How do I say &quot;Hello&quot;?
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => setInput("Let's practice ordering food.")}>
                    Practice ordering food
                  </Badge>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <motion.div 
                key={msg.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className="space-y-2">
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted/50 border rounded-tl-sm"
                  )}>
                    {msg.content}
                  </div>

                  {msg.role === 'assistant' && msg.corrections && msg.corrections.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg p-3 text-xs space-y-2">
                      <div className="font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Correction
                      </div>
                      {msg.corrections.map((c, i) => (
                        <div key={i} className="space-y-1">
                          <div className="line-through text-muted-foreground opacity-70">{c.original}</div>
                          <div className="text-green-600 dark:text-green-400 font-medium">{c.correction}</div>
                          <div className="text-muted-foreground italic">{c.explanation}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.translation && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      <Globe className="w-3 h-3 mr-1" /> {msg.translation}
                    </Badge>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted/50 border rounded-2xl rounded-tl-sm p-4 flex items-center gap-1 h-10">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Type a message in ${learningLanguage}...`}
                className="w-full min-h-[50px] max-h-[150px] p-3 pr-10 resize-none rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30"
                rows={1}
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-2 bottom-2 h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!input.trim() || isLoading}
              className="h-[50px] w-[50px] rounded-xl flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-2">
            AI can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
}
