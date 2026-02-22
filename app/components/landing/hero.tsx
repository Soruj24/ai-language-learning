"use client";

import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40 flex flex-col items-center justify-center text-center px-4">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-green-500/10 rounded-full blur-[100px] -z-10 opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          New: AI Pronunciation Coach
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-white">
          Master Any Language <br />
          with <span className="gradient-text">AI Intelligence</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Experience the future of language learning. Real-time conversations, 
          instant feedback, and personalized lessons powered by advanced AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-105">
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-gray-700 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-all hover:scale-105">
                <Play className="mr-2 h-5 w-5 fill-current" />
                Watch Demo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] bg-[#0F172A] border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">Platform Demo</DialogTitle>
                <DialogDescription className="text-gray-400">
                  See how our AI tutor helps you master a new language.
                </DialogDescription>
              </DialogHeader>
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-800 flex items-center justify-center group">
                {/* Placeholder for actual video */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
                <div className="text-center z-10 p-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-indigo-400 fill-current ml-1" />
                  </div>
                  <p className="text-lg font-medium text-white mb-2">Interactive Demo Loading...</p>
                  <p className="text-sm text-gray-400">We are preparing a personalized demo experience for you.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm font-medium">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#0F172A] bg-gray-800 flex items-center justify-center overflow-hidden relative z-[${10-i}]`}>
                <Image 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} 
                  alt="User"
                  width={40}
                  height={40}
                />
              </div>
            ))}
          </div>
          <p>Trusted by 10,000+ learners</p>
        </div>
      </motion.div>
    </section>
  );
}
