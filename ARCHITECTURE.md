# Vocalis Architecture Overview

**Created by Rachit**

## System Architecture

\`\`\`
┌─────────────────────────────────────────────┐
│           User Interface Layer              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Welcome  │  │ DateTime │  │   Voice   │ │
│  │  Card    │  │ Display  │  │ Assistant │ │
│  └──────────┘  └──────────┘  └───────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Weather  │  │   Todo   │  │  Search   │ │
│  │  Card    │  │   List   │  │    Bar    │ │
│  └──────────┘  └──────────┘  └───────────┘ │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Voice Assistant Context Layer          │
│  • State Management                         │
│  • Speech Recognition                       │
│  • Text-to-Speech                           │
│  • Command Processing                       │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│        Command Handler Layer                │
│  • Pattern Matching (Regex)                 │
│  • Command Routing                          │
│  • Action Execution                         │
│  • Response Generation                      │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           Backend API Layer                 │
│  • Express Server (Port 3001)               │
│  • /api/search                              │
│  • /api/weather                             │
│  • /api/health                              │
└─────────────────────────────────────────────┘
\`\`\`

## Key Components

### 1. Voice Assistant Context
Central state management for voice features:
- `isListening`: Speech recognition active
- `isSpeaking`: TTS speaking
- `lastCommand`: Last recognized command
- `response`: Generated response
- `error`: Error messages
- `isOnline`: Network status

### 2. Command Handler
Modular command processing system with pattern matching:
- Greeting commands
- Time/Date queries
- Weather updates
- Todo management
- Web navigation (YouTube, WhatsApp, ChatGPT, Google)
- Music playback
- Utilities (help, repeat, shutdown)

### 3. Speech Recognition Wrapper
Robust speech recognition with:
- Browser compatibility detection
- Automatic retry on errors
- Network error handling
- Configurable options

### 4. Text-to-Speech Wrapper
Natural voice output with:
- Voice selection support
- Rate, pitch, volume control
- Event callbacks
- Cancel functionality

## Data Flow

### Voice Command Flow
\`\`\`
User speaks → Speech Recognition → Voice Context
                                         ↓
                               Command Handler
                                         ↓
                          Pattern Match & Route
                                         ↓
                   Execute Action + Generate Response
                                         ↓
                            TTS Speaks + UI Updates
\`\`\`

### Web Navigation Commands
\`\`\`
"Open YouTube" → Command Handler → window.open()
"Search X on Google" → Extract query → Open Google search
"Play a song" → Open YouTube Music
\`\`\`

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Voice**: Web Speech API
- **Backend**: Express.js
- **State**: React Context + localStorage

## Security & Performance

- HTTPS required for speech recognition
- Input validation on commands
- Error boundaries for stability
- Memoized callbacks for performance
- LocalStorage for persistence

## Future Enhancements

- Wake word detection ("Hey Vocalis")
- AI integration (OpenAI/Claude)
- User authentication
- Calendar integration
- Multi-language support
- Offline mode with service workers

---

**Created by Rachit**
**Last Updated: 2025**
