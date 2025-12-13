"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import { useState, useEffect } from "react"

interface Quote {
  content: string
  author: string
}

export function WelcomeCard() {
  const [quote, setQuote] = useState<Quote>({ 
    content: "Loading inspirational quote...", 
    author: "" 
  })
  const [userName, setUserName] = useState("USER")

  useEffect(() => {
    const savedQuote = localStorage.getItem("vocalis-daily-quote")
    const savedDate = localStorage.getItem("vocalis-quote-date")
    const today = new Date().toDateString()

    const savedName = localStorage.getItem("vocalis-user-name")
    if (savedName) {
      setUserName(savedName)
    }

    if (savedQuote && savedDate === today) {
      setQuote(JSON.parse(savedQuote))
      return
    }

    const fetchQuote = async () => {
      try {
        const response = await fetch("https://api.quotable.io/random")
        const data = await response.json()
        const newQuote = { content: data.content, author: data.author }
        setQuote(newQuote)
        localStorage.setItem("vocalis-daily-quote", JSON.stringify(newQuote))
        localStorage.setItem("vocalis-quote-date", today)
      } catch {
        setQuote({
          content: "Believe you can and you're halfway there.",
          author: "Theodore Roosevelt"
        })
      }
    }
    
    fetchQuote()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "GOOD MORNING"
    if (hour < 18) return "GOOD AFTERNOON"
    return "GOOD EVENING"
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
          V
        </div>
        <div>
          <h2 className="text-lg font-semibold">HELLO {userName.toUpperCase()}</h2>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-32 flex items-center justify-center bg-muted/50 rounded-lg">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DALL%C2%B7E%202025-01-26%2022.22.33%20-%20A%20unique%20and%20minimalistic%20icon%20for%20a%20voice%20assistant%20app%20called%20Vocalis.%20The%20design%20features%20an%20innovative,%20abstract%20interpretation%20of%20a%20soundwave%20m-bgfEyV6kdyQ5W447n79TMiVTO2VgbI.png"
            alt="Vocalis App Icon"
            width={64}
            height={64}
            className="rounded-full"
            priority
          />
        </div>
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold">QUOTE OF THE DAY</h3>
          <p className="text-sm italic">"{quote.content}"</p>
          {quote.author && <p className="text-xs text-muted-foreground">— {quote.author}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
