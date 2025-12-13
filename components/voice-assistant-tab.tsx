"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, MicOff, Send, WifiOff, AlertCircle, Volume2, VolumeX, RefreshCw } from 'lucide-react'
import { useVoiceAssistant } from "@/contexts/voice-assistant-context"

export function VoiceAssistantTab() {
  const {
    isListening,
    isSpeaking,
    lastCommand,
    response,
    error,
    isOnline,
    startListening,
    stopListening,
    processTextCommand,
  } = useVoiceAssistant()
  const [inputText, setInputText] = useState("")
  const [retryCount, setRetryCount] = useState(0)

  const handleSend = useCallback(async () => {
    if (inputText.trim()) {
      await processTextCommand(inputText)
      setInputText("")
    }
  }, [inputText, processTextCommand])

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1)
    startListening()
  }, [startListening])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setRetryCount(0), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Voice Assistant
          <div className="flex items-center space-x-2">
            {!isOnline && <WifiOff className="h-4 w-4 text-red-500" />}
            <Button
              variant="outline"
              size="icon"
              onClick={() => (isListening ? stopListening() : startListening())}
              disabled={!isOnline}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            {isSpeaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="flex items-center justify-between text-yellow-500 bg-yellow-50 p-2 rounded">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-1" /> Retry
              </Button>
            </div>
          )}
          {lastCommand && (
            <div>
              <strong>You said:</strong> {lastCommand}
            </div>
          )}
          {response && (
            <div>
              <strong>Assistant:</strong> {response}
            </div>
          )}
          <div className="flex space-x-2">
            <Input
              placeholder="Type a command..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
