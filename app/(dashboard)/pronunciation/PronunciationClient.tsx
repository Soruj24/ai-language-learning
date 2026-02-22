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
import {
  Mic,
  Square,
  Play,
  RefreshCw,
  Volume2,
  Lock,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/app/lib/i18n/LanguageContext";
import { Badge } from "@/app/components/ui/badge";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

const FALLBACK_WORDS = ["Hello", "World", "Computer", "Language", "Learning"];

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
  const { t, learningLanguage } = useLanguage();
  const [words, setWords] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState("");
  const [accent, setAccent] = useState<"US" | "UK">("US");
  const [refAudioBuffer, setRefAudioBuffer] = useState<AudioBuffer | null>(
    null,
  );
  const [userAudioBuffer, setUserAudioBuffer] = useState<AudioBuffer | null>(
    null,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [loadingRef, setLoadingRef] = useState(false);
  const [loadingWords, setLoadingWords] = useState(false);
  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);

  const refCanvasRef = useRef<HTMLCanvasElement>(null);
  const userCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  // Initialize AudioContext
  useEffect(() => {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Fetch words on load or language change
  useEffect(() => {
    const fetchWords = async () => {
      setLoadingWords(true);
      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agent: "vocabulary",
            input: `Generate 10 common words for pronunciation practice in ${learningLanguage}. Return a list.`,
            learningLanguage,
          }),
        });
        const data = await response.json();

        if (data.items && Array.isArray(data.items)) {
          const wordList = data.items.map((item: { word: string }) => item.word);
          setWords(wordList);
          if (wordList.length > 0) setSelectedWord(wordList[0]);
        } else {
          setWords(FALLBACK_WORDS);
          setSelectedWord(FALLBACK_WORDS[0]);
        }
      } catch (e) {
        console.error("Failed to fetch words", e);
        setWords(FALLBACK_WORDS);
        setSelectedWord(FALLBACK_WORDS[0]);
      } finally {
        setLoadingWords(false);
      }
    };

    fetchWords();
  }, [learningLanguage]);

  // Fetch reference audio when word or accent changes
  useEffect(() => {
    if (selectedWord) {
      fetchReferenceAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWord, accent, learningLanguage]);

  // Draw waveforms when buffers change
  useEffect(() => {
    if (refAudioBuffer && refCanvasRef.current) {
      drawWaveform(refAudioBuffer, refCanvasRef.current, "#3b82f6"); // Blue for reference
    } else if (refCanvasRef.current) {
      // Clear canvas if no buffer
      const canvas = refCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    // Only fetch waveform for English using dictionaryapi.dev
    if (learningLanguage === "English") {
      try {
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${selectedWord}`,
        );
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          // throw new Error("Word not found");
          // Silent fail for UI
          setLoadingRef(false);
          return;
        }

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
    } else {
      // For other languages, we just use TTS, so no buffer
      setLoadingRef(false);
    }
  };

  const playReference = () => {
    if (refAudioBuffer && audioContextRef.current) {
      setIsPlayingRef(true);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = refAudioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
      source.onended = () => setIsPlayingRef(false);
    } else {
      // Fallback to TTS
      const utterance = new SpeechSynthesisUtterance(selectedWord);
      // Map language names to codes
      const langMap: Record<string, string> = {
        English: "en-US",
        Spanish: "es-ES",
        French: "fr-FR",
        German: "de-DE",
        Italian: "it-IT",
        Portuguese: "pt-PT",
        Japanese: "ja-JP",
        Chinese: "zh-CN",
        Russian: "ru-RU",
      };
      utterance.lang = langMap[learningLanguage] || "en-US";
      utterance.onstart = () => setIsPlayingRef(true);
      utterance.onend = () => setIsPlayingRef(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    if (!audioContextRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const arrayBuffer = await blob.arrayBuffer();
        if (audioContextRef.current) {
          const decodedBuffer =
            await audioContextRef.current.decodeAudioData(arrayBuffer);
          setUserAudioBuffer(decodedBuffer);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
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
    }
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
    ctx.fillStyle = color;
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("pronunciationCoach")}
          </h1>
          <p className="text-muted-foreground">{t("improveAccent")}</p>
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={selectedWord}
            onValueChange={setSelectedWord}
            disabled={loadingWords || words.length === 0}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={loadingWords ? "Loading words..." : "Select word"}
              />
            </SelectTrigger>
            <SelectContent>
              {words.map((word) => (
                <SelectItem key={word} value={word}>
                  {word}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSelectedWord(words[Math.floor(Math.random() * words.length)])
            }
            disabled={words.length === 0}
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingWords ? "animate-spin" : ""}`}
            />
          </Button>

          {learningLanguage === "English" && (
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={accent === "US" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setAccent("US")}
                className="text-xs"
              >
                US
              </Button>
              <Button
                variant={accent === "UK" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setAccent("UK")}
                className="text-xs"
              >
                UK
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Reference Audio Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("referenceAudio")}</CardTitle>
            <CardDescription>{t("listenNative")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-32 bg-secondary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
              {loadingRef ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : refAudioBuffer ? (
                <canvas
                  ref={refCanvasRef}
                  width={400}
                  height={128}
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Volume2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">
                    {learningLanguage === "English"
                      ? "No waveform available"
                      : "Waveform available for English only"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                className="rounded-full h-16 w-16"
                onClick={playReference}
                disabled={isPlayingRef}
              >
                {isPlayingRef ? (
                  <Volume2 className="h-8 w-8 animate-pulse" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {t("clickToListen")}
            </p>
          </CardContent>
        </Card>

        {/* User Recording Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("yourRecording")}</CardTitle>
            <CardDescription>{t("recordCompare")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-32 bg-secondary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
              {userAudioBuffer ? (
                <canvas
                  ref={userCanvasRef}
                  width={400}
                  height={128}
                  className="w-full h-full"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">{t("startRecording")}</p>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className="rounded-full h-16 w-16"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <Square className="h-8 w-8" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>

              {userAudioBuffer && (
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-16 w-16"
                  onClick={playUserRecording}
                  disabled={isPlayingUser || isRecording}
                >
                  {isPlayingUser ? (
                    <Volume2 className="h-8 w-8 animate-pulse" />
                  ) : (
                    <Play className="h-8 w-8" />
                  )}
                </Button>
              )}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {isRecording ? t("recording") : t("clickToRecord")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pronunciation Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Pronunciation Tips: {selectedWord}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Focus on the stress and intonation. Listen carefully to the
            reference audio and try to match the rhythm.
            {learningLanguage !== "English" &&
              " Note: Reference audio is generated using Text-to-Speech."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
