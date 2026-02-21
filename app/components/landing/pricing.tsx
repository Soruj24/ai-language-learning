"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "Access to basic lessons",
      "Limited AI conversations (10 mins/day)",
      "Daily progress tracking",
      "Community access"
    ],
    cta: "Start Learning",
    ctaVariant: "outline" as const,
    popular: false
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    features: [
      "Unlimited AI conversations",
      "Advanced pronunciation analysis",
      "Custom learning path",
      "Offline mode",
      "Priority support"
    ],
    cta: "Go Pro",
    ctaVariant: "gradient" as const,
    popular: true
  },
  {
    name: "Team",
    price: "$49",
    period: "/month",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "Admin dashboard",
      "Team analytics",
      "Custom vocabulary lists"
    ],
    cta: "Contact Sales",
    ctaVariant: "outline" as const,
    popular: false
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[#0F172A] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent <span className="text-indigo-400">pricing</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Choose the plan that fits your learning goals. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
            >
              <Card 
                className={`relative overflow-hidden border-gray-800 bg-[#111827] h-full transition-transform duration-300 hover:scale-105 ${
                  plan.popular ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 z-10 scale-105' : 'hover:border-indigo-500/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pt-8 pb-4">
                  <CardTitle className="text-2xl font-bold text-white mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-300">
                        <Check className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="block mt-8">
                    <Button 
                      className="w-full h-12 text-lg rounded-xl font-semibold transition-all hover:scale-105" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
