"use client";

import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Mic, 
  Brain, 
  LineChart, 
  Zap, 
  Globe 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";

const features = [
  {
    title: "AI Conversations",
    description: "Chat naturally with our advanced AI tutor that adapts to your proficiency level and interests.",
    icon: MessageSquare,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10"
  },
  {
    title: "Pronunciation Coach",
    description: "Get real-time feedback on your accent and intonation with speech recognition technology.",
    icon: Mic,
    color: "text-green-400",
    bg: "bg-green-500/10"
  },
  {
    title: "Smart Vocabulary",
    description: "Learn words that matter most to you with our spaced repetition system powered by AI.",
    icon: Brain,
    color: "text-amber-400",
    bg: "bg-amber-500/10"
  },
  {
    title: "Progress Analytics",
    description: "Track your fluency growth with detailed charts and personalized insights.",
    icon: LineChart,
    color: "text-blue-400",
    bg: "bg-blue-500/10"
  },
  {
    title: "Instant Feedback",
    description: "Correct mistakes in real-time. Our AI explains grammar rules as you make errors.",
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-500/10"
  },
  {
    title: "Cultural Context",
    description: "Learn more than just language. Understand cultural nuances and idioms for true fluency.",
    icon: Globe,
    color: "text-pink-400",
    bg: "bg-pink-500/10"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-[#0F172A] relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Everything you need to <span className="text-indigo-400">master fluency</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our platform combines cutting-edge AI with proven language learning methodologies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#111827]/50 border-gray-800 backdrop-blur-sm hover:bg-[#1F2937]/50 transition-all duration-300 hover:border-indigo-500/30 group h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-indigo-300 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
