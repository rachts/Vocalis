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
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#030303] text-on-surface antialiased selection:bg-primary/30 h-screen w-full overflow-hidden flex font-body-md text-body-md relative">
        <div className="scanlines"></div>
        <div className="noise-overlay"></div>
        <VoiceAssistantProvider>
          {children}
        </VoiceAssistantProvider>
      </body>
    </html>
  )
}
