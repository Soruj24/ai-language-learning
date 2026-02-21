"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Mic, Square, Play, RefreshCw, Volume2, Lock } from "lucide-react";
import { useLanguage } from "@/app/lib/i18n/LanguageContext";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";

const PRACTICE_WORDS = [
  "schedule",
  "water",
  "aluminum",
  "advertisement",
  "tomato",
  "vase",
  "lever",
  "vitamin",
  "privacy",
  "mobile",
];

interface PronunciationClientProps {
  isPro: boolean;
}

interface Phonetic {
  text?: string;
  audio?: string;
}

export default function PronunciationClient({
  isPro,
}: PronunciationClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t, learningLanguage } = useLanguage();
  const [selectedWord, setSelectedWord] = useState(PRACTICE_WORDS[0]);
  const [accent, setAccent] = useState<"US" | "UK">("US");
  const [refAudioBuffer, setRefAudioBuffer] = useState<AudioBuffer | null>(
    null,
  );
  const [userAudioBuffer, setUserAudioBuffer] = useState<AudioBuffer | null>(
    null,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [loadingRef, setLoadingRef] = useState(false);
  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);

  const refCanvasRef = useRef<HTMLCanvasElement>(null);
  const userCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioContextRef.current = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Fetch reference audio when word or accent changes
  useEffect(() => {
    fetchReferenceAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWord, accent]);

  // Draw waveforms when buffers change
  useEffect(() => {
    if (refAudioBuffer && refCanvasRef.current) {
      drawWaveform(refAudioBuffer, refCanvasRef.current, "#3b82f6"); // Blue for reference
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refAudioBuffer]);

  useEffect(() => {
    if (userAudioBuffer && userCanvasRef.current) {
      drawWaveform(userAudioBuffer, userCanvasRef.current, "#22c55e"); // Green for user
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAudioBuffer]);

  if (!isPro) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="w-full max-w-md text-center border-primary shadow-lg">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Pro Feature Locked</CardTitle>
            <CardDescription>
              Pronunciation Analysis is available for Pro and Premium members
              only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Get real-time feedback on your accent and improve your speaking
              skills with advanced AI analysis.
            </p>
            <ul className="text-left space-y-2 mb-6 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Detailed waveform comparison
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Native speaker reference audio
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Accent specific training (US/UK)
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/billing" className="w-full">
              <Button className="w-full" size="lg">
                Upgrade to Pro
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const fetchReferenceAudio = async () => {
    setLoadingRef(true);
    setRefAudioBuffer(null);
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${selectedWord}`,
      );
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0)
        throw new Error("Word not found");

      const phonetics: Phonetic[] = data[0].phonetics;
      // Find audio based on accent
      let audioUrl: string | undefined;
      if (accent === "US") {
        audioUrl =
          phonetics.find((p) => p.audio?.endsWith("-us.mp3"))?.audio ||
          phonetics.find((p) => p.audio?.includes("us"))?.audio;
      } else {
        audioUrl =
          phonetics.find((p) => p.audio?.endsWith("-uk.mp3"))?.audio ||
          phonetics.find((p) => p.audio?.includes("uk"))?.audio;
      }

      // Fallback to any audio if specific accent not found
      if (!audioUrl) audioUrl = phonetics.find((p) => p.audio)?.audio;

      if (audioUrl) {
        const audioRes = await fetch(audioUrl);
        const arrayBuffer = await audioRes.arrayBuffer();
        if (audioContextRef.current) {
          const decodedBuffer =
            await audioContextRef.current.decodeAudioData(arrayBuffer);
          setRefAudioBuffer(decodedBuffer);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reference audio", error);
    } finally {
      setLoadingRef(false);
    }
  };

  const playReference = () => {
    if (!refAudioBuffer || !audioContextRef.current) return;

    setIsPlayingRef(true);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = refAudioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
    source.onended = () => setIsPlayingRef(false);
  };

  const playUserRecording = () => {
    if (!userAudioBuffer || !audioContextRef.current) return;

    setIsPlayingUser(true);
    const source = audioContextRef.current.createBufferSource();
    source.buffer = userAudioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
    source.onended = () => setIsPlayingUser(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        if (audioContextRef.current) {
          const decodedBuffer =
            await audioContextRef.current.decodeAudioData(arrayBuffer);
          setUserAudioBuffer(decodedBuffer);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  const drawWaveform = (
    buffer: AudioBuffer,
    canvas: HTMLCanvasElement,
    color: string,
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }

    ctx.stroke();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Pronunciation Lab
          </h2>
          <p className="text-muted-foreground">
            Master your accent with AI-powered analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={accent === "US" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setAccent("US")}
          >
            US
          </Badge>
          <Badge
            variant={accent === "UK" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setAccent("UK")}
          >
            UK
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Practice Word</CardTitle>
            <CardDescription>
              Listen to the native pronunciation and record your own
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {PRACTICE_WORDS.map((word) => (
                <Button
                  key={word}
                  variant={selectedWord === word ? "default" : "outline"}
                  onClick={() => setSelectedWord(word)}
                  className="capitalize"
                >
                  {word}
                </Button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 py-8">
              <h3 className="text-4xl font-bold capitalize">{selectedWord}</h3>

              <div className="flex gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={playReference}
                  disabled={loadingRef || isPlayingRef}
                >
                  {isPlayingRef ? (
                    <Volume2 className="mr-2 h-5 w-5 animate-pulse" />
                  ) : (
                    <Play className="mr-2 h-5 w-5" />
                  )}
                  Listen
                </Button>

                {isRecording ? (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopRecording}
                  >
                    <Square className="mr-2 h-5 w-5" />
                    Stop
                  </Button>
                ) : (
                  <Button size="lg" onClick={startRecording}>
                    <Mic className="mr-2 h-5 w-5" />
                    Record
                  </Button>
                )}

                {userAudioBuffer && (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={playUserRecording}
                    disabled={isPlayingUser}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    My Recording
                  </Button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Reference ({accent})</span>
                </div>
                <div className="bg-muted rounded-lg p-4 h-32 flex items-center justify-center relative overflow-hidden">
                  {loadingRef ? (
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : (
                    <canvas
                      ref={refCanvasRef}
                      width={400}
                      height={100}
                      className="w-full h-full"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Your Recording</span>
                  {userAudioBuffer && (
                    <span className="text-green-600">Good Match!</span>
                  )}
                </div>
                <div className="bg-muted rounded-lg p-4 h-32 flex items-center justify-center relative overflow-hidden">
                  {userAudioBuffer ? (
                    <canvas
                      ref={userCanvasRef}
                      width={400}
                      height={100}
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="text-muted-foreground text-sm flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Press record to start
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
