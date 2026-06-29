import { Router } from 'express';

export const healthRouter = Router();

const sampleData = [
  { id: 1, title: "Getting Started with Vocalis", content: "Vocalis is your personal AI voice assistant. Created by Rachit." },
  { id: 2, title: "Voice Commands", content: "You can ask about time, weather, add todos, and set reminders." },
  { id: 3, title: "Search Functionality", content: "Use the search bar to find information quickly and efficiently." },
  { id: 4, title: "Weather Updates", content: "Get real-time weather information for your location." },
  { id: 5, title: "Todo Management", content: "Add, view, and manage your daily tasks with ease." },
];

healthRouter.get("/search", (req, res) => {
  try {
    const query = (req.query.q as string)?.toLowerCase() || "";
    
    if (!query) {
      res.json([]);
      return;
    }
    
    const results = sampleData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "An error occurred during search" });
  }
});

healthRouter.get("/weather", (req, res) => {
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
  });
});

healthRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Vocalis OS",
    version: "1.0.1",
    createdBy: "Rachit",
    time: new Date().toISOString()
  });
});
