import { VoiceAssistantProvider } from "@/contexts/voice-assistant-context"
import type { Metadata } from "next"
import "./globals.css"
import type React from "react"

export const metadata: Metadata = {
  title: "Vocalis - AI Voice Assistant",
  description: "Your Personal AI Voice Assistant - Created by Rachit",
  authors: [{ name: "Rachit" }],
  creator: "Rachit",
  generator: 'v0.app',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  }
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=DM+Serif+Display&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[var(--color-cream)] text-[var(--color-ink)] font-sans antialiased h-screen w-full overflow-hidden flex relative selection:bg-[var(--color-glow-soft)]">
        <VoiceAssistantProvider>
          {children}
        </VoiceAssistantProvider>
      </body>
    </html>
  )
}
