"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, ArrowRight, Bot, Zap, Globe, Sparkles, CheckCircle2, Layout, MessagesSquare, Code, Settings, Loader2 } from "lucide-react"
import { FloatingMic } from "@/components/floating-mic"
import Link from "next/link"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <FloatingMic />

      {/* --- HEADER --- */}
      <header className="fixed top-0 w-full z-40 glass-panel border-b-0 border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border border-primary/50 overflow-hidden flex items-center justify-center glow-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <img src="/logo.png" alt="Vocalis Icon" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight">Vocalis</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/70">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Live Demo</a>
          <a href="#use-cases" className="hover:text-foreground transition-colors">Use Cases</a>
        </nav>
        <div className="flex items-center gap-4 relative z-50">
          <Link href="https://github.com/rachts/Vocalis" target="_blank" rel="noreferrer" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors cursor-pointer block">GitHub</Link>
          <Link href="#demo" className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-semibold transition-all hover:glow-primary cursor-pointer block">
            Get early access
          </Link>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-primary/30 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Vocalis v1 Beta is live</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
            Talk to your browser.<br className="hidden md:block" /> Get things done.
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/60 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            Vocalis is a real-time AI voice assistant that listens, responds, and executes tasks instantly. Navigate the web, write emails, and command apps perfectly hands-free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-semibold text-lg transition-all hover:scale-105 glow-primary flex items-center justify-center gap-2 group">
              <Mic className="w-5 h-5 group-hover:animate-pulse" />
              Start Talking
            </button>
            <button className="w-full sm:w-auto px-8 py-4 glass-panel border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-2">
              Watch Demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-20 relative w-full max-w-5xl aspect-video rounded-2xl glass-panel border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center group"
        >
          {/* Abstract Soundwave / AI Orb in Hero */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
          
          <div className="relative z-10 flex flex-col items-center justify-center">
            <motion.div 
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 40px -10px hsl(var(--primary))",
                  "0 0 80px -10px hsl(var(--primary))",
                  "0 0 40px -10px hsl(var(--primary))"
                ]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
            >
              <Mic className="w-12 h-12 text-white" />
            </motion.div>
            <p className="mt-8 text-xl font-medium text-foreground/80">"Summarize this webpage for me"</p>
          </div>
        </motion.div>
      </section>

      {/* --- LIVE DEMO SECTION --- */}
      <section id="demo" className="py-24 px-6 md:px-12 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">See Vocalis in action</h2>
            <p className="text-lg text-foreground/50 max-w-2xl mx-auto">Experience seamless voice execution. Click the suggestions below or just ask.</p>
          </div>

          <div className="grid md:grid-cols-[1fr_400px] gap-8 max-w-6xl mx-auto">
            {/* Interactive Browser Mockup */}
            <div className="glass-panel border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <div className="bg-card/50 border-b border-white/5 p-3 flex items-center gap-2">
                <div className="flex gap-1.5 ml-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 flex-1 bg-white/5 rounded-md h-7 flex items-center px-4 text-xs text-foreground/40 font-mono">
                  vocalis.ai/demo
                </div>
              </div>
              <div className="flex-1 bg-gradient-to-b from-card/20 to-background p-8 flex flex-col relative">
                <div className="flex-1">
                  <TypewriterChat />
                </div>
              </div>
            </div>

            {/* Commands Panel */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-2">Try these commands</h3>
              <CommandCard title="Search YouTube" subtitle="Finds videos hands-free" icon={<Globe className="w-5 h-5 text-accent" />} />
              <CommandCard title="Open Google Docs" subtitle="Creates a new document instantly" icon={<Layout className="w-5 h-5 text-emerald-400" />} />
              <CommandCard title="Summarize Page" subtitle="Reads long articles for you" icon={<MessagesSquare className="w-5 h-5 text-primary" />} />
              <CommandCard title="Switch to Dark Mode" subtitle="Controls browser settings" icon={<Settings className="w-5 h-5 text-purple-400" />} />
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 px-6 relative bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-foreground/50">Three steps to a completely hands-free web experience.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -translate-y-1/2" />
            
            <StepCard number="01" title="Speak" desc="Just talk naturally. Vocalis uses ultra-fast LLMs to transcribe your intent." delay={0} />
            <StepCard number="02" title="Understand" desc="Context-aware AI maps your voice command to web actions and APIs." delay={0.2} />
            <StepCard number="03" title="Execute" desc="Forms are filled, clicks are made, and workflows happen visually in real-time." delay={0.4} />
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 px-6 md:px-12 relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Unmatched Capabilities</h2>
          <p className="text-lg text-foreground/50">Built for speed, accuracy, and power.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard icon={<Mic className="w-6 h-6" />} title="Voice Commands" text="Speak naturally to navigate." />
          <FeatureCard icon={<Zap className="w-6 h-6" />} title="Real-Time Response" text="Near-zero latency execution." />
          <FeatureCard icon={<Code className="w-6 h-6" />} title="Task Execution" text="Complex multi-step workflows." />
          <FeatureCard icon={<Bot className="w-6 h-6" />} title="Smart UI Understanding" text="Agent sees what you see." />
        </div>
      </section>

      {/* --- USE CASES --- */}
      <section id="use-cases" className="py-24 px-6 relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-12 text-center">Built for everyone</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <UseCaseCard title="Developers" desc="Read docs, format JSON, and search StackOverflow without leaving your IDE window." />
            <UseCaseCard title="Students" desc="Instantly summarize research papers, create flashcards, and search Wikipedia blindly." />
            <UseCaseCard title="Productivity Power Users" desc="Fill forms, manage calendars, and blast through email backlogs with just your voice." />
            <UseCaseCard title="Accessibility" desc="Navigate the entire modern web regardless of physical limitations using precise voice control." />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/5 bg-card/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Vocalis Icon" className="w-6 h-6 object-cover rounded-md" />
            <span className="font-bold text-lg">Vocalis.</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-foreground/50 relative z-50">
            <Link href="/privacy" className="hover:text-primary transition-colors cursor-pointer block">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors cursor-pointer block">Terms</Link>
            <Link href="/docs" className="hover:text-primary transition-colors cursor-pointer block">Docs</Link>
            <Link href="https://github.com/rachts/Vocalis" target="_blank" className="hover:text-primary transition-colors cursor-pointer block">GitHub</Link>
          </div>

          <div className="text-sm text-foreground/40 flex items-center gap-2 relative z-50">
            <span>Built by </span>
            <Link href="https://github.com/rachts/Vocalis" target="_blank" className="text-foreground/80 hover:text-primary transition-colors font-medium cursor-pointer block">Rachts</Link>
            <span className="ml-2 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs">v1 Beta</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

function CommandCard({ title, subtitle, icon }: { title: string, subtitle: string, icon: React.ReactNode }) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5">
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-lg bg-card/80 border border-white/5 group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-foreground/90 group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-xs text-foreground/50">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function StepCard({ number, title, desc, delay }: { number: string, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, duration: 0.6 }}
      className="glass-panel p-8 rounded-2xl relative z-10 border border-white/5 bg-background/50 hover:bg-card/50 transition-colors"
    >
      <div className="text-6xl font-black text-white/5 mb-6">{number}</div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-foreground/60 leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-card border border-white/10 flex items-center justify-center mb-6 text-foreground/70 group-hover:text-primary group-hover:border-primary/30 transition-all">
        {icon}
      </div>
      <h4 className="text-lg font-semibold mb-2">{title}</h4>
      <p className="text-sm text-foreground/50">{text}</p>
    </div>
  )
}

function UseCaseCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="glass-panel p-8 rounded-2xl border border-white/5 hover:border-accent/30 transition-all hover:bg-accent/5 group">
      <div className="flex items-start gap-4">
        <CheckCircle2 className="w-6 h-6 text-accent mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div>
          <h4 className="text-xl font-semibold mb-3">{title}</h4>
          <p className="text-foreground/60 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  )
}

// Simple interactive mock chat typewriter effect
function TypewriterChat() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 1500)
    const timer2 = setTimeout(() => setStep(2), 3500)
    const timer3 = setTimeout(() => setStep(3), 5500)
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3) }
  }, [])

  return (
    <div className="flex flex-col gap-6 font-mono text-sm max-w-lg">
      <AnimatePresence mode="popLayout">
        {step >= 1 && (
          <motion.div
            key="user-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-start"
          >
            <div className="w-8 h-8 rounded bg-primary/20 flex flex-shrink-0 items-center justify-center">
              <span className="text-lg">🧑</span>
            </div>
            <div className="bg-card/50 px-4 py-3 rounded-lg border border-white/10 text-foreground/80">
              "Compile my last meeting notes into a bulleted summary."
            </div>
          </motion.div>
        )}
        
        {step >= 2 && step < 3 && (
          <motion.div
            key="processing-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-center ml-11 text-primary/60"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Processing via Vocalis Engine...</span>
          </motion.div>
        )}

        {step >= 3 && (
           <motion.div
              key="vocalis-response"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 items-start"
           >
             <div className="w-8 h-8 rounded bg-accent/20 flex flex-shrink-0 items-center justify-center">
               <Mic className="w-4 h-4 text-accent" />
             </div>
             <div className="glass-panel px-5 py-4 rounded-lg border border-accent/20 text-foreground/90 glow-accent/20 shadow-xl overflow-hidden relative">
               <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
               <p className="mb-2 text-accent text-xs font-semibold uppercase tracking-wider">Task Complete</p>
               <ul className="space-y-2 text-foreground/80 list-disc list-inside">
                 <li>Project X launch delayed to Friday</li>
                 <li>Design team needs updated assets by tomorrow</li>
                 <li>Marketing budget approved for Q3</li>
               </ul>
             </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
