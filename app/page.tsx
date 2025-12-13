"use client"

import { DateTimeDisplay } from "@/components/date-time-display"
import { Notifications } from "@/components/notifications"
import { TodoList } from "@/components/todo-list"
import { WeatherCard } from "@/components/weather-card"
import { WelcomeCard } from "@/components/welcome-card"
import { VocalisOrb } from "@/components/vocalis-orb"
import { VoiceAssistantTab } from "@/components/voice-assistant-tab"
import { SearchBar } from "@/components/search-bar"
import { useState, useEffect } from "react"
import { format } from "date-fns"

export default function Home() {
  const [weather, setWeather] = useState({
    temperature: 27,
    location: "Gonin Gora, Kad",
    date: format(new Date(), "EEEE, d MMMM"),
  })

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
        const response = await fetch(`${apiUrl}/api/weather`)
        const data = await response.json()
        setWeather({
          temperature: data.temperature,
          location: data.location,
          date: data.date,
        })
      } catch (error) {
        console.error("Failed to fetch weather:", error)
      }
    }
    
    fetchWeather()
    const interval = setInterval(fetchWeather, 300000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-background p-4 relative">
      <div className="max-w-7xl mx-auto grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <DateTimeDisplay />
          <WeatherCard 
            temperature={weather.temperature} 
            location={weather.location} 
            date={weather.date} 
          />
          <VoiceAssistantTab />
          <SearchBar />
        </div>
        <div className="space-y-4">
          <WelcomeCard />
          <TodoList />
        </div>
        <div>
          <Notifications />
        </div>
      </div>
      <VocalisOrb />
    </main>
  )
}
