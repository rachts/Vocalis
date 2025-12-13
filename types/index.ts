// Common types used across the application

export interface SearchResult {
  id: number
  title: string
  content: string
}

export interface WeatherData {
  temperature: number
  location: string
  date: string
  condition?: string
  humidity?: number
  windSpeed?: number
}

export interface TodoItem {
  id: number
  title: string
  description: string
  completed?: boolean
}

export interface Notification {
  id: number
  title: string
  description: string
  read?: boolean
  timestamp?: string
}

export interface VoiceCommand {
  command: string
  handler: (args: string) => Promise<string>
  examples?: string[]
}
