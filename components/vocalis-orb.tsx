"use client"

import Image from "next/image"
import { Mic, MicOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useVoiceAssistant } from "@/contexts/voice-assistant-context"

export function VocalisOrb() {
  const { isListening, lastCommand, startListening, stopListening } = useVoiceAssistant()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-8 right-8 w-16 h-16 rounded-full p-0 bg-transparent hover:bg-transparent"
          onClick={startListening}
        >
          <div className="relative w-16 h-16">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-01-26%2022.22.33%20-%20A%20unique%20and%20minimalistic%20icon%20for%20a%20voice%20assistant%20app%20called%20Vocalis.%20The%20design%20features%20an%20innovative,%20abstract%20interpretation%20of%20a%20soundwave%20m-bgfEyV6kdyQ5W447n79TMiVTO2VgbI.png"
              alt="Vocalis Assistant"
              width={64}
              height={64}
              className={`transform transition-transform duration-500 ${isListening ? "scale-110" : "scale-100"}`}
            />
            {isListening && <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />}
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Vocalis Assistant
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => (isListening ? stopListening() : startListening())}
            >
              {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4 text-purple-500" />}
            </Button>
          </DialogTitle>
          <DialogDescription>{lastCommand ? `"${lastCommand}"` : "How can I help you today?"}</DialogDescription>
        </DialogHeader>
        <div className="h-[200px] flex items-center justify-center">
          {isListening ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Listening...</p>
              <div className="flex justify-center space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-purple-500 rounded-full animate-pulse"
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      height: `${Math.random() * 24 + 16}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">Try saying:</p>
              <ul className="text-sm space-y-2">
                <li>"What time is it?"</li>
                <li>"What's the weather?"</li>
                <li>"Add todo: Buy groceries"</li>
                <li>"Set reminder: Meeting at 2 PM"</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
