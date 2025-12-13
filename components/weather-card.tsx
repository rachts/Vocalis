"use client"

import { Sun } from 'lucide-react'
import { Card } from "@/components/ui/card"

interface WeatherCardProps {
  temperature: number
  location: string
  date: string
}

export function WeatherCard({ temperature, location, date }: WeatherCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-5xl font-bold">{temperature}°</h2>
          <p className="text-sm mt-1">{location}</p>
          <p className="text-xs opacity-80">{date}</p>
        </div>
        <Sun className="h-12 w-12" />
      </div>
    </Card>
  )
}
