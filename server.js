const express = require('express');
const cors = require('cors');

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const sampleData = [
  { id: 1, title: "Getting Started with Vocalis", content: "Vocalis is your personal AI voice assistant. Created by Rachit." },
  { id: 2, title: "Voice Commands", content: "You can ask about time, weather, add todos, and set reminders." },
  { id: 3, title: "Search Functionality", content: "Use the search bar to find information quickly and efficiently." },
  { id: 4, title: "Weather Updates", content: "Get real-time weather information for your location." },
  { id: 5, title: "Todo Management", content: "Add, view, and manage your daily tasks with ease." },
]

app.get("/api/search", (req, res) => {
  try {
    const query = req.query.q?.toLowerCase() || ""
    
    if (!query) {
      return res.json([])
    }
    
    const results = sampleData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
    )
    
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: "An error occurred during search" })
  }
})

app.get("/api/weather", (req, res) => {
  res.json({
    temperature: 27,
    location: "Gonin Gora, Kad",
    condition: "Sunny",
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Vocalis",
    version: "1.0.0",
    createdBy: "Rachit",
    time: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`Vocalis API server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
