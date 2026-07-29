# Vocalis AI Operating System (AIOS) Architecture Guide

Welcome to the **Vocalis AI Operating System (AIOS)** core foundation architecture. This comprehensive transformation elevates Vocalis from a traditional command-based assistant into a scalable, production-ready AI Operating System while strictly preserving **100% of existing voice features and frontend UI components**.

---

## 1. Executive Overview & Design Principles

The architecture adheres strictly to **SOLID design principles**, utilizing clean interfaces and decoupled subsystems so that future reasoning engines, memory persistence databases, and specialized agents can plug into the system with zero friction.

### Key Highlights:
1. **No Global Singletons**: Every subsystem (Logger, EventBus, Config, ToolRegistry) is instantiated and registered via an immutable **Dependency Injection Service Container** (`ServiceContainer`).
2. **Pluggable & Interchangeable**: Third-party LLM APIs (OpenAI, Anthropic, Gemini) and voice streams (Deepgram, WebRTC, VAD) interact through standardized abstract boundaries (`BaseAIProvider`, `ISpeechToTextProvider`, `IVoiceSession`), shielding application logic from vendor lock-in.
3. **Thread-Safe Eventing**: A centralized, wildcard-supporting **Event Bus** connects asynchronous cognitive workflows, memory indexing, and voice audio packets without tightly coupling sender and receiver.
4. **Strict TypeScript & Zero Placeholders**: Every interface, abstract implementation, and utility is production-ready, fully typed, and designed for enterprise deployment.

---

## 2. Architecture & Directory Tree

```
src/
├── types/                 # Universal OS primitives, Result types, and pagination schemas
├── utils/                 # Cryptographic IDs, async resilience (timeout/retries), error guards
├── config/                # Type-safe configuration manager with deep-merge environment overrides
├── core/                  # Primary OS Engine infrastructure
│   ├── errors/            # Unified AIOSError hierarchy (Provider, Tool, Planner, Memory, Voice)
│   ├── events/            # Thread-safe IEventBus and OS telemetry event constants
│   ├── logging/           # Pluggable logger (Console, File, Telemetry transports)
│   ├── providers/         # AI Provider contracts and BaseAIProvider lifecycle abstractions
│   ├── tools/             # Centralized Tool Registry for dynamic capability resolution
│   ├── planner/           # Autonomous Plan, ExecutionStep, ToolCall, and AgentResponse types
│   ├── memory/            # 4-Tier Memory (Session, Long-Term, Knowledge, Conversation Store)
│   └── workflow/          # Multi-step workflow engines and adaptive routing strategies
├── agents/                # Specialist and Executive Agent hierarchies and base classes
├── voice/                 # Speech-To-Text, Text-To-Speech, VAD, and Audio Stream abstractions
├── services/              # Lightweight Dependency Injection Service Container and tokens
├── aios.ts                # AIOS Root Application Facade
└── index.ts               # Master module exporter
```

---

## 3. Subsystem Deep Dive

### A. Dependency Injection (`ServiceContainer`)
Instead of referencing global static variables, modules declare their dependencies via typed tokens (`AIOSTokens`). The container supports three lifetimes:
- **Instance**: Pre-constructed instances registered directly.
- **Singleton**: Evaluated lazily on first resolve and cached.
- **Transient**: Re-instantiated via factory on every resolution.

Supports `.createChildContainer()` for isolating tenant state across concurrent voice interactions.

### B. Centralized Tool Registry (`ToolRegistry`)
Every executable capability in Vocalis is defined as an `ITool` with a strict `ToolParameterSchema`. When executed through `ToolRegistry.execute(name, args)`, the registry automatically:
- Validates parameter presence.
- Generates correlation execution IDs (`callId`).
- Records exact duration and logs debugging telemetry.
- Emits real-time progress via the system `EventBus` (`ToolExecuting`, `ToolExecuted`, `ToolFailed`).

### C. Multi-Tier Memory Layer
- **`ISessionMemory`**: Fast ephemeral working RAM scratchpad per user session (`EphemeralSessionMemory`).
- **`ILongTermMemory`**: Key-value repository for persistent preferences across sessions.
- **`IKnowledgeMemory`**: Semantic vector database contract for Retrieval Augmented Generation (RAG).
- **`IConversationStore`**: Long-term chronological repository of user dialogs and assistant tool turns.

### D. Agent & Workflow Hierarchies
- **`ISpecialistAgent`**: Domain expert workers capable of reporting self-assessed task capabilities via `.canHandle()`.
- **`IExecutiveAgent`**: Top-level coordinators that decompose complex user instructions into discrete steps and delegate them to registered specialist workers.
- **`IWorkflowEngine`**: Executes deterministic or adaptive multi-step pipelines (`sequential`, `parallel`, `conditional`, `adaptive-agent`).

---

## 4. Quick Start Usage Guide

### Initializing the AIOS Root Facade

```typescript
import { AIOS, AIOSEventTypes, BaseTool } from './src';

// 1. Initialize the Operating System with custom configuration
const os = AIOS.init({
  environment: 'development',
  logging: {
    level: 'debug',
    console: true,
    json: false,
  },
  voice: {
    sampleRateHz: 16000,
    vadSensitivity: 'high',
  },
});

// 2. Subscribe to systemic OS telemetry events
os.events.on(AIOSEventTypes.TOOL_EXECUTED, (payload) => {
  console.log(`Tool finished: ${payload.toolName} in ${payload.durationMs}ms`);
});
```

### Registering and Executing Custom Tools

```typescript
import type { ToolParameterSchema, ToolExecutionContext } from './src';
import { BaseTool } from './src';

// Define a simple custom capability
class WeatherTool extends BaseTool<{ city: string }, string> {
  public readonly name = 'get_weather';
  public readonly description = 'Retrieves live atmospheric temperatures for a specific city';
  public readonly parameters: ToolParameterSchema = {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'Destination city name', required: true },
    },
    required: ['city'],
  };

  protected async doExecute(args: { city: string }, context?: ToolExecutionContext): Promise<string> {
    // In production, execute network requests or SDK queries
    return `The current temperature in ${args.city} is 72°F and sunny.`;
  }
}

// Register into OS
os.registerTool(new WeatherTool());

// Execute capability safely
const result = await os.tools.execute('get_weather', { city: 'San Francisco' });
console.log(result.output); // -> "The current temperature in San Francisco is 72°F and sunny."
```

### Creating Child Scopes for Multi-Tenant Voice Sessions

```typescript
// Create an isolated child context for a new caller session
const sessionContext = os.createChildContext();

// Session logger automatically inherits root transports while isolating state
sessionContext.logger.info('Voice interaction session started.');
```

---

## 5. Verification & Testing Standards

All code is strictly typed and built to conform without warnings under TypeScript compiler verification.
To run automated type-checking and verify systemic architecture integrity across the repository:

```bash
npm run type-check
```
*(Or `npx tsc --noEmit`)*
