import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="glass-panel p-8 md:p-12 rounded-2xl border border-white/5">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="space-y-6 text-foreground/70 leading-relaxed">
            <p>Last updated: April 2026</p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Vocalis, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Description of Service</h2>
            <p>
              Vocalis provides a voice automation frontend interacting with an intelligent API. Service performance is dependent on local environment capabilities (such as Mac OS app integrations) and microphone permissions.
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. User Conduct</h2>
            <p>
              Users are strictly prohibited from utilizing the vocal automation to bypass web security, overwhelm APIs through constant requests, or execute malicious OS-level commands.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
