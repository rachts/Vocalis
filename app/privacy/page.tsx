import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/5">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="space-y-6 text-foreground/70 leading-relaxed">
            <p>Last updated: April 2026</p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Information We Collect</h2>
            <p>
              Vocalis is designed with privacy as a foundational principle. We only collect the necessary voice and interaction data required to process your commands via our backend architecture. We do not sell your personal data.
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. How We Use Your Data</h2>
            <p>
              Audio transcripts are immediately parsed by our intelligence engine to execute web automation and commands. Context patterns may be temporarily aggregated to improve intent matching, but are purged regularly.
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Security</h2>
            <p>
              All traffic between the Vocalis frontend UI and the Python FastAPI "Brain" is securely transmitted. API logic relies on secured endpoints to keep your browser interactions isolated.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
