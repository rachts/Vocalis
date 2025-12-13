# Vocalis Changelog

## Version 1.0.0 - Production Release

### Created by Rachit

---

## [1.0.0] - 2025-01-27

### Added
- **Robust Speech Recognition** (`lib/speechRecognition.ts`)
  - Automatic retry mechanism (max 3 attempts)
  - Proper error handling for network and no-speech errors
  - Client-side only guards to prevent SSR issues
  
- **Text-to-Speech Engine** (`lib/tts.ts`)
  - Voice selection support
  - Configurable rate, pitch, and volume
  - Proper cancellation and cleanup
  
- **Centralized Command Handler** (`lib/commandHandler.ts`)
  - All commands: greeting, time, date, weather, todo, reminder, search, summarize, play music, notifications, voice change, repeat, shutdown
  - Fallback responses for unconnected services
  - Extensible command pattern
  
- **Health Check Endpoint** (`/api/health`)
  - Returns app status, version, creator, and timestamp
  
- **Type-Check Script** in package.json
  - Added `npm run type-check` command

### Changed
- **Voice Assistant Context** - Complete refactor using new speech/TTS modules
  - useCallback hooks for performance
  - useRef for persistent instances
  - Improved state management
  
- **Package.json** - Production-ready with pinned versions
  - All dependencies use exact versions (no ^ or ~)
  - Separate dependencies vs devDependencies
  - Node.js 18+ requirement
  
- **Next.js Config** - Removed build error ignoring
  - Enforces TypeScript and ESLint checks
  - Production-safe configuration

### Removed
- All debug console.log statements
- Unnecessary comments and code blocks
- Duplicate voice-assistant-context implementations
- Build-time error ignoring

### Fixed
- TypeScript errors across all files
- SSR/hydration issues with window usage
- Speech recognition retry logic
- TTS cancellation before new utterances

### Security
- No credentials or API keys in code
- Environment variables properly documented
- Minimal dependency footprint

---

## Commit History

1. `chore: pin dependencies and update package.json for production`
   - Exact versions for all packages
   - Added type-check script
   - Node 18+ requirement

2. `feat: add robust speech recognition wrapper`
   - Retry mechanism
   - Error handling
   - Client-side guards

3. `feat: add TTS helper and voice switching`
   - Voice selection
   - Proper cleanup
   - Event handlers

4. `feat: add centralized commandHandler with new commands`
   - All requested commands
   - Fallback responses
   - Extensible pattern

5. `refactor: voice assistant context improvements and performance`
   - useCallback optimization
   - useRef for instances
   - Clean state management

6. `fix: resolve TypeScript and build errors`
   - All type errors fixed
   - Build passes clean

7. `chore: remove debug logs, comments, and references`
   - Clean code
   - Production-ready

8. `chore: update credits to Created by Rachit and add health endpoint`
   - All metadata updated
   - /api/health added

---

**Final Status:** Production-ready, type-safe, fully tested.
