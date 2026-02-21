"use client";

import { motion } from "framer-motion";
import { UserPlus, MessageSquare, LineChart } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";

const steps = [
  {
    step: "01",
    title: "Sign Up & Set Goals",
    description: "Create your free account and tell us your target language and proficiency level.",
    icon: UserPlus,
    color: "bg-indigo-500"
  },
  {
    step: "02",
    title: "Chat with AI Tutor",
    description: "Start conversing immediately. Our AI adapts to your level and corrects you gently.",
    icon: MessageSquare,
    color: "bg-purple-500"
  },
  {
    step: "03",
    title: "Track Progress & Master",
    description: "Watch your fluency score grow as you practice daily and unlock new levels.",
    icon: LineChart,
    color: "bg-green-500"
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#111827] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            How it <span className="text-indigo-400">works</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Start speaking a new language in minutes with our simple 3-step process.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0 -z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="flex flex-col items-center">
                <div className={`w-24 h-24 rounded-2xl ${step.color} shadow-lg shadow-indigo-500/20 flex items-center justify-center mb-8 rotate-3 hover:rotate-0 transition-transform duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="bg-[#1F2937]/50 backdrop-blur-sm border border-gray-800 p-8 rounded-2xl w-full hover:border-indigo-500/30 transition-colors">
                  <span className="text-sm font-bold text-indigo-400 tracking-wider uppercase mb-2 block">Step {step.step}</span>
                  <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
