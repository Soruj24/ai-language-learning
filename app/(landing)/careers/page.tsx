import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { Footer } from "@/app/components/landing/footer";
import { ArrowRight, Code, Brain, Palette } from "lucide-react";

export default function CareersPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-gray-100">
      <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-white tracking-tight">
                <span className="gradient-text">Lingua</span>AI
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-gray-300 hover:text-white">Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Join the <span className="gradient-text">Revolution</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We're on a mission to break down language barriers with advanced AI. 
            Build the future of communication with us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <div className="bg-[#1F2937]/50 border border-gray-800 p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Innovation First</h3>
            <p className="text-gray-400">We push the boundaries of what's possible with LLMs and speech recognition.</p>
          </div>
          <div className="bg-[#1F2937]/50 border border-gray-800 p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Global Impact</h3>
            <p className="text-gray-400">Your work will help millions of people connect, learn, and grow across cultures.</p>
          </div>
          <div className="bg-[#1F2937]/50 border border-gray-800 p-8 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Remote Culture</h3>
            <p className="text-gray-400">Work from anywhere in the world. We value output and creativity over hours.</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-8 text-center">Open Positions</h2>
        <div className="space-y-4 max-w-4xl mx-auto">
          {[
            { title: "Senior Full Stack Engineer", department: "Engineering", icon: Code },
            { title: "AI Research Scientist", department: "Research", icon: Brain },
            { title: "Product Designer", department: "Design", icon: Palette },
          ].map((job, index) => (
            <div key={index} className="flex items-center justify-between p-6 bg-[#1F2937] border border-gray-800 rounded-xl hover:border-indigo-500/50 transition-all group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <job.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                  <p className="text-sm text-gray-400">{job.department} • Remote</p>
                </div>
              </div>
              <Button variant="ghost" className="text-gray-400 group-hover:text-white">
                Apply <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
