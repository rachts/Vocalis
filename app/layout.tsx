import { VoiceAssistantProvider } from "@/contexts/voice-assistant-context"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import type React from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Vocalis - AI Voice Assistant",
  description: "Your Personal AI Voice Assistant - Created by Rachit",
  authors: [{ name: "Rachit" }],
  creator: "Rachit",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <VoiceAssistantProvider>{children}</VoiceAssistantProvider>
      </body>
    </html>
  )
}
