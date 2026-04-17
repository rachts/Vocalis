import { ArrowLeft, Terminal, Server, Zap } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/5">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-foreground/60 text-lg mb-12">Learn how to configure and interact with the Vocalis Jarvis architecture.</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
             <div className="p-6 rounded-xl bg-card border border-white/5">
               <Server className="w-8 h-8 text-primary mb-4" />
               <h3 className="text-xl font-semibold mb-2">FastAPI Backend</h3>
               <p className="text-sm text-foreground/60">
                 The intelligent brain. Run <code>uvicorn main:app --reload</code> inside the <code>backend/</code> directory to start processing intents.
               </p>
             </div>
             
             <div className="p-6 rounded-xl bg-card border border-white/5">
               <Zap className="w-8 h-8 text-accent mb-4" />
               <h3 className="text-xl font-semibold mb-2">Next.js UI</h3>
               <p className="text-sm text-foreground/60">
                 The polished frontend shell containing the visualizer. It securely records input and routes to localhost.
               </p>
             </div>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Available Commands</h2>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <table className="w-full text-sm text-left">
              <thead className="bg-white/5 text-foreground/80 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Command Intent</th>
                  <th className="px-6 py-4 font-medium">Resulting Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-foreground/70">
                <tr><td className="px-6 py-4">"Search Wikipedia for [Topic]"</td><td className="px-6 py-4">Pulls Wikipedia snippet via API</td></tr>
                <tr><td className="px-6 py-4">"System status"</td><td className="px-6 py-4">Reads out Mac CPU, Memory & Battery</td></tr>
                <tr><td className="px-6 py-4">"Open Spotify"</td><td className="px-6 py-4">Executes local Mac OS app instance</td></tr>
                <tr><td className="px-6 py-4">"Search Google for [Query]"</td><td className="px-6 py-4">Opens query string in default browser</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
