'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, RefreshCw, Volume2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';

interface SpeechTrainerProps {
  targetText: string;
  onComplete?: (score: number) => void;
}

interface AnalysisResult {
  score: number;
  feedback: string;
  mispronouncedWords: string[];
  tips: string[];
}

export default function SpeechTrainer({ targetText, onComplete }: SpeechTrainerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      cleanupAudio();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const startRecording = async () => {
    try {
      cleanupAudio();
      setResult(null);
      setAudioBlob(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      drawWaveform();
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Keep the stream active for a moment if needed, but usually we stop tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const drawWaveform = () => {
    if (!analyserRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!isRecording) return;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = 'rgb(255, 255, 255)'; // or background color
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3b82f6'; // Blue-500
      ctx.beginPath();
      
      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    
    draw();
  };

  const analyzeAudio = async () => {
    if (!audioBlob) return;
    
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('text', targetText);
      
      const response = await fetch('/api/speech-trainer', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Analysis failed');
      
      const data = await response.json();
      setResult(data);
      if (onComplete) onComplete(data.score);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playRecording = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.play();
  };

  const renderHighlightedText = () => {
    if (!result) return <p className="text-lg font-medium text-center">{targetText}</p>;
    
    const words = targetText.split(' ');
    return (
      <div className="text-lg font-medium text-center flex flex-wrap justify-center gap-1">
        {words.map((word, index) => {
          // Simple matching, removing punctuation for comparison
          const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
          const isMispronounced = result.mispronouncedWords.some(
            mw => mw.toLowerCase() === cleanWord.toLowerCase()
          );
          
          return (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`px-1 rounded ${
                isMispronounced 
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                  : 'text-green-600 dark:text-green-400'
              }`}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-blue-600" />
          Speech Trainer
        </CardTitle>
        <CardDescription>Read the text below clearly to check your pronunciation</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="min-h-[60px] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          {renderHighlightedText()}
        </div>

        <div className="relative h-32 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden border border-border/50">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={128}
            className="w-full h-full"
          />
          {!isRecording && !audioBlob && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Waveform visualization
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <AnimatePresence mode="wait">
            {!isRecording ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <Button 
                  size="lg" 
                  className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                  onClick={startRecording}
                >
                  <Mic className="w-6 h-6 text-white" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <Button 
                  size="lg" 
                  variant="destructive"
                  className="rounded-full w-16 h-16 shadow-lg shadow-red-500/25 animate-pulse"
                  onClick={stopRecording}
                >
                  <Square className="w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          {audioBlob && !isRecording && (
             <motion.div
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
             >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full w-16 h-16 border-2"
                  onClick={playRecording}
                  disabled={isPlaying}
                >
                  {isPlaying ? <Volume2 className="w-6 h-6 animate-pulse" /> : <Play className="w-6 h-6" />}
                </Button>
             </motion.div>
          )}
        </div>

        {audioBlob && !isRecording && !result && (
          <div className="flex justify-center">
             <Button onClick={analyzeAudio} disabled={isAnalyzing} className="w-full max-w-xs">
               {isAnalyzing ? (
                 <>
                   <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                 </>
               ) : (
                 'Analyze Pronunciation'
               )}
             </Button>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Pronunciation Score</span>
                  <span className={result.score >= 80 ? 'text-green-600' : result.score >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                    {result.score}%
                  </span>
                </div>
                <Progress value={result.score} className="h-2" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-border/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Feedback
                  </h4>
                  <p className="text-sm text-muted-foreground">{result.feedback}</p>
                </div>
                
                {result.tips.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <AlertCircle className="w-4 h-4" />
                      Tips
                    </h4>
                    <ul className="text-sm space-y-1 text-blue-600 dark:text-blue-400">
                      {result.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
