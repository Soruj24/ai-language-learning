"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              <span className="gradient-text">Lingua</span>AI
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</Link>
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">How it Works</Link>
            <Link href="#testimonials" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Testimonials</Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">Get Started</Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[#111827] border-b border-gray-800"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="#features" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Features</Link>
            <Link href="#how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">How it Works</Link>
            <Link href="#testimonials" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Testimonials</Link>
            <Link href="#pricing" className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Pricing</Link>
            <div className="pt-4 flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700">Log in</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Get Started</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
