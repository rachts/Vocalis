# Vocalis - AI Voice Assistant

**Created by Rachit**

A modern, intelligent voice assistant built with Next.js, React, and TypeScript.

## Features

- **Voice Recognition** - Natural speech recognition with retry logic
- **Text-to-Speech** - High-quality voice responses
- **Smart Commands** - Time, weather, todos, reminders, search, and more
- **Web Navigation** - Open YouTube, WhatsApp Web, ChatGPT, Google with voice commands
- **Todo Management** - Create, complete, delete, read, and clear tasks with localStorage persistence
- **Search Functionality** - Quick search with detailed results
- **Real-time Updates** - Live date, time, and weather information
- **Entertainment** - Jokes and interesting facts on demand
- **Responsive Design** - Works beautifully on all devices
- **Dark Mode** - Eye-friendly interface with semantic theming

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher

### Installation

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Copy environment variables:

\`\`\`bash
cp .env.local .env
\`\`\`

4. Start the development servers:

\`\`\`bash
npm run dev:all
\`\`\`

This runs both the Next.js frontend (port 3000) and Express backend (port 3001).

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks
- `npm run format` - Format code with Prettier
- `npm run server` - Start Express backend
- `npm run dev:all` - Start both frontend and backend

## Voice Commands

Try saying:

### Basic
- "Hi" / "Hello" - Greeting
- "Help" - See all available commands

### Time & Date
- "What time is it?"
- "Tell me the time"
- "What's the date?"
- "Tell me the date"

### Weather
- "What's the weather?"
- "Weather update"

### Entertainment
- "Tell me a joke"
- "Tell me a fact"

### Todos & Reminders
- "Add todo: Buy groceries"
- "Create task: Call mom"
- "Read my todos"
- "Clear todos"
- "Remind me to take medicine at 5 PM"

### Web Navigation
- "Open Google"
- "Open YouTube"
- "Open WhatsApp Web"
- "Open ChatGPT"
- "Search for quantum physics"
- "Search for cats on Google"

### Music
- "Play a song"

### Utilities
- "Repeat" - Repeat last response
- "Shutdown" - Stop voice assistant

## Project Structure

\`\`\`
vocalis/
├── app/                    # Next.js app directory
├── components/             # React components
├── contexts/              # React contexts
├── lib/                   # Utility libraries
├── config/                # Configuration files
├── public/                # Static assets
└── server.js              # Express backend
\`\`\`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` - Your production API URL
4. Deploy

### Environment Variables

Create `.env.production` with:

\`\`\`
NEXT_PUBLIC_API_URL=https://your-api-url.com
\`\`\`

## Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Voice**: Web Speech API
- **Backend**: Express.js
- **Date Handling**: date-fns

## Browser Support

- Chrome/Edge 80+
- Firefox 90+
- Safari 14.1+

Note: Speech recognition requires HTTPS in production.

## License

Created by Rachit - All rights reserved.

## Support

For issues or questions, please open an issue on GitHub.
