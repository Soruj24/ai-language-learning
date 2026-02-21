"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-gray-800 text-gray-400 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="text-xl font-bold text-white">
              <span className="gradient-text">Lingua</span>AI
            </span>
          </Link>
          <p className="text-sm leading-relaxed mb-4">
            Empowering global communication through artificial intelligence.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#features" className="hover:text-indigo-400 transition-colors">Features</Link></li>
            <li><Link href="#pricing" className="hover:text-indigo-400 transition-colors">Pricing</Link></li>
            <li><Link href="#testimonials" className="hover:text-indigo-400 transition-colors">Testimonials</Link></li>
            <li><Link href="/blog" className="hover:text-indigo-400 transition-colors">Blog</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link></li>
            <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Subscribe</h4>
          <p className="text-sm mb-4">Get the latest updates and learning tips.</p>
          <form className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter email" 
              className="w-full bg-[#1F2937] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm">
        © {new Date().getFullYear()} LinguaAI. All rights reserved.
      </div>
    </footer>
  );
}
