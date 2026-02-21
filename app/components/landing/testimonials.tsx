"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Digital Nomad",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    quote: "I tried Duolingo for years but couldn't hold a conversation. With LinguaAI, I was speaking Spanish confidently in 3 weeks!"
  },
  {
    name: "Marcus Rodriguez",
    role: "Software Engineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    quote: "The AI tutor feels incredibly real. It corrected my pronunciation nuances that other apps completely missed."
  },
  {
    name: "Emily Watson",
    role: "Travel Blogger",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    quote: "The best investment I've made for my travels. Being able to chat with locals in their native tongue changed my entire trip."
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[#0F172A] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Loved by <span className="text-indigo-400">learners</span> worldwide
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Don&apos;t just take our word for it. See what our community has to say.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Card className="bg-[#111827] border-gray-800 p-8 h-full hover:border-indigo-500/30 transition-all duration-300 relative group">
                <Quote className="absolute top-8 right-8 text-indigo-500/10 w-12 h-12 group-hover:text-indigo-500/20 transition-colors" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-12 w-12 border-2 border-indigo-500/20">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed italic relative z-10">
                    &quot;{testimonial.quote}&quot;
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
