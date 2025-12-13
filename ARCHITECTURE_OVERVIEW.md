# Vocalis Architecture Overview

**Created by Rachit**

## System Architecture

### High-Level Overview

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Welcome   │  │  Date/Time   │  │  Voice Assistant │    │
│  │   Card     │  │   Display    │  │       Tab        │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Weather   │  │  Todo List   │  │   Search Bar     │    │
│  │   Card     │  │              │  │                  │    │
│  └────────────┘  └──────────────┘  └──────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          Floating Vocalis Orb (bottom-right)        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Voice Assistant Context                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  State Management (isListening, response, error)     │   │
│  │  Speech Recognition Wrapper                          │   │
│  │  Text-to-Speech Wrapper                              │   │
│  │  Command Processing                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Command Handler Layer                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pattern Matching (Regex-based)                      │   │
│  │  Command Routing                                     │   │
│  │  Action Execution                                    │   │
│  │  Response Generation                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express Server (Port 3001)                          │   │
│  │  /api/search - Search functionality                  │   │
│  │  /api/weather - Weather data                         │   │
│  │  /api/health - Health check                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      External Services                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Quotable API (Daily quotes)                         │   │
│  │  Browser Web Speech API                              │   │
│  │  Future: OpenAI, Weather APIs, etc.                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Component Architecture

### 1. Presentation Layer (Components)

#### Core Components
- **WelcomeCard**: Displays greeting, app icon, and daily inspirational quote
- **DateTimeDisplay**: Real-time date and time display
- **WeatherCard**: Weather information with temperature and location
- **TodoList**: Full CRUD todo management with localStorage persistence
- **VoiceAssistantTab**: Text-based command input and voice controls
- **SearchBar**: Search functionality with results display
- **VocalisOrb**: Floating voice assistant activation button
- **Notifications**: Notification management UI

#### Shared Components (shadcn/ui)
- Button, Card, Input, Checkbox, Dialog
- All components use semantic design tokens for theming

### 2. Context Layer

#### VoiceAssistantContext
- Manages global voice assistant state
- Handles speech recognition lifecycle
- Manages text-to-speech operations
- Processes commands and generates responses
- Handles online/offline state

**State Properties:**
- `isListening`: Boolean - Currently listening for voice input
- `isSpeaking`: Boolean - Currently speaking response
- `lastCommand`: String - Last recognized command
- `response`: String - Last generated response
- `error`: String | null - Current error message
- `isOnline`: Boolean - Network connectivity status

**Methods:**
- `startListening()`: Activate voice recognition
- `stopListening()`: Stop voice recognition
- `processTextCommand(text)`: Process text command
- `speak(text)`: Speak text using TTS

### 3. Business Logic Layer

#### Command Handler (`lib/commandHandler.ts`)

**Pattern Matching System:**
\`\`\`typescript
const commands = {
  greeting: /^(hi|hello|hey)$/i,
  time: /^what time is it$/i,
  // ... more patterns
}
\`\`\`

**Command Flow:**
1. Receive raw text input
2. Normalize and trim input
3. Match against command patterns
4. Extract parameters from matches
5. Execute appropriate action
6. Generate and return response

**Command Categories:**
- Greetings: Basic hello responses
- Time/Date: Current time and date
- Todos: Add, list, manage todos
- Reminders: Set reminders
- Weather: Get weather information
- Search: Web search functionality
- Navigation: Open websites/apps
- Music: Play music
- Utilities: Help, repeat, shutdown

#### Speech Recognition Wrapper (`lib/speechRecognition.ts`)

**Features:**
- Browser compatibility detection
- Automatic retry on no-speech error
- Network error handling
- Configurable options (lang, continuous, etc.)
- Clean lifecycle management

**Error Handling:**
- Network errors
- No speech detected
- Browser not supported
- Recognition failures

#### Text-to-Speech Wrapper (`lib/tts.ts`)

**Features:**
- Voice selection support
- Configurable rate, pitch, volume
- Event callbacks (onStart, onEnd, onError)
- Cancel current speech
- Check speaking status

### 4. Data Layer

#### Local Storage
- **vocalis-todos**: Persisted todo list
- **vocalis-daily-quote**: Cached daily quote
- **vocalis-quote-date**: Quote cache date
- **vocalis-user-name**: User's custom name

#### API Endpoints
- **GET /api/search?q=query**: Search functionality
- **GET /api/weather**: Weather data
- **GET /api/health**: Server health check

## Data Flow

### Voice Command Flow

\`\`\`
User speaks → SpeechRecognition API → VoiceAssistantContext
                                              ↓
                            commandHandler.handleCommand()
                                              ↓
                                Pattern matching & routing
                                              ↓
                            ┌─────────────────┴─────────────────┐
                            ↓                                   ↓
                    Execute Action                    Generate Response
                    (open URL, add todo, etc.)         (text message)
                            │                                   │
                            └─────────────────┬─────────────────┘
                                              ↓
                                        TTS speaks response
                                              ↓
                                        UI updates
\`\`\`

### Search Flow

\`\`\`
User types query → SearchBar component → API request
                                              ↓
                                    Backend /api/search
                                              ↓
                                    Filter sample data
                                              ↓
                                    Return results array
                                              ↓
                            Display results in SearchBar
                                              ↓
                            User clicks result → DetailedResult modal
\`\`\`

### Todo Flow

\`\`\`
User adds todo → TodoList component → State update
                                              ↓
                            Save to localStorage
                                              ↓
                            Re-render component
                                              ↓
Voice command → "add todo X" → commandHandler
                                              ↓
                            Call ctx.addTodo(X)
                                              ↓
                            Update component state
\`\`\`

## State Management Strategy

### Component-Level State
- Used for UI-specific state (input values, loading states)
- useState for simple state
- useCallback for memoized functions
- useEffect for side effects

### Context State
- VoiceAssistantContext for shared voice state
- Reduces prop drilling
- Provides global access to voice features

### Persistent State
- localStorage for user preferences and data
- Automatic save/load on component mount
- Fallback to default values if not found

### Server State
- Fetched on demand from API
- Cached when appropriate (weather every 5 minutes)
- Error handling with user feedback

## Error Handling

### Layers of Error Handling

1. **Browser API Level**
   - Check for feature support
   - Handle API errors gracefully
   - Provide fallbacks

2. **Network Level**
   - Detect online/offline state
   - Retry failed requests
   - Display user-friendly errors

3. **Component Level**
   - Try-catch blocks around risky operations
   - Display error UI
   - Prevent crashes

4. **Global Level**
   - Error boundaries (to be added)
   - Logging and monitoring
   - Graceful degradation

## Performance Optimizations

### Current Optimizations
- Memoized callbacks with useCallback
- Ref usage to avoid re-renders
- Lazy loading of heavy components
- Debounced user inputs
- Optimized re-render cycles

### Future Optimizations
- Code splitting with dynamic imports
- Image optimization with Next.js Image
- Service worker for offline support
- Virtual scrolling for large lists
- Web Workers for heavy computations

## Security Considerations

### Current Security
- Environment variables for API URLs
- Input validation in command handler
- CORS configuration in backend
- No sensitive data in localStorage
- HTTPS required for speech recognition

### Future Security
- Rate limiting on API endpoints
- Input sanitization
- Content Security Policy headers
- API authentication
- CSRF protection

## Scalability Plan

### Database Integration
- Replace localStorage with PostgreSQL/MongoDB
- User authentication system
- Persistent todo/reminder storage
- User preferences and history

### AI Integration
- OpenAI/Claude for smart responses
- Context-aware conversations
- Learning user preferences
- Personalized recommendations

### Microservices
- Separate authentication service
- Dedicated AI processing service
- Weather data service
- Search service with Elasticsearch

### Monitoring & Analytics
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- User behavior tracking
- Voice command success rates

## Technology Choices

### Why Next.js 15?
- App Router for modern routing
- Server/Client component architecture
- Built-in optimizations
- Excellent developer experience
- Easy deployment on Vercel

### Why TypeScript?
- Type safety prevents bugs
- Better IDE support
- Self-documenting code
- Refactoring confidence

### Why Tailwind CSS?
- Utility-first approach
- Rapid development
- Consistent design system
- Easy theming support
- Small bundle size

### Why Web Speech API?
- Native browser support
- No external dependencies
- Low latency
- Free to use
- Good accuracy

## Future Architecture Improvements

### Planned Enhancements
1. Add error boundaries for better error handling
2. Implement service worker for offline support
3. Add Web Workers for background processing
4. Implement proper state machine for voice states
5. Add telemetry and analytics
6. Implement A/B testing framework
7. Add comprehensive test suite (Jest, Playwright)
8. Implement CI/CD pipeline
9. Add Docker support
10. Create mobile app with React Native

---

**Created by Rachit**
**Last Updated: 2025**
