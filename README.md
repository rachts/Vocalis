<div align="center">
  <h1>🎙️ Vocalis</h1>
  <h3>AI Voice Operating System (AIOS)</h3>
  <p>Autonomous voice intelligence that runs on your machine.<br/>
  <b>Local-first.</b> Multi-tier voice AI. Agent-powered. No subscriptions.</p>

  <p>
    <a href="#features">Features</a> ·
    <a href="#architecture">Architecture</a> ·
    <a href="#quickstart">Quickstart</a> ·
    <a href="#voice-commands">Commands</a> ·
    <a href="#project-structure">Structure</a> ·
    <a href="#faq">FAQ</a>
  </p>

  <p>
    <a href="https://github.com/your-username/Vocalis/stargazers"><img src="https://img.shields.io/github/stars/your-username/Vocalis?style=flat-square&color=f59e0b" alt="Stars" /></a>
    <a href="https://github.com/your-username/Vocalis/releases"><img src="https://img.shields.io/github/v/release/your-username/Vocalis?style=flat-square&color=10b981" alt="Release" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" /></a>
    <a href="https://github.com/your-username/Vocalis/issues"><img src="https://img.shields.io/github/issues/your-username/Vocalis?style=flat-square&color=ef4444" alt="Issues" /></a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express-Backend-404040?style=flat-square&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
    <img src="https://img.shields.io/badge/OmniVoice-Local%20AI-8b5cf6?style=flat-square" alt="OmniVoice" />
  </p>
</div>

<br/>

<div align="center">
  <img src="docs/screenshot-hero.png" alt="Vocalis Dashboard" width="100%"/>
  <br/>
  <sub><b>The Vocalis Dashboard</b> — Interactive voice orb, live widgets, and real-time transcript history.</sub>
</div>

> **Your voice is the most natural interface you have.** Vocalis turns it into an operating system: speak, and it navigates, remembers, creates, and executes — blending local neural voice AI with autonomous agent reasoning. Everything stays on your machine unless you choose otherwise.

---

<a id="features"></a>

## ✨ Features

<table>
<tr>
  <td width="50%" align="center">
    <h3>🧠 Autonomous Agent Brain</h3>
    <sub>Modular, persistent agent workflows that resume across restarts. Google Gemini reasoning with dynamic tool routing.</sub>
  </td>
  <td width="50%" align="center">
    <h3>🎙️ Advanced Audio Pipeline</h3>
    <sub>Local neural voice via OmniVoice Studio + cloud fallbacks (Deepgram, ElevenLabs) + browser Web Speech API.</sub>
  </td>
</tr>
<tr>
  <td width="50%" align="center">
    <h3>⚡ Real-Time WebSockets</h3>
    <sub>Socket.IO bidirectional streaming for voice telemetry, audio chunks, and agent execution events.</sub>
  </td>
  <td width="50%" align="center">
    <h3>🎨 Interactive Visualizer Orb</h3>
    <sub>GSAP + Framer Motion animated states: listening, thinking, speaking, ready. A living UI centerpiece.</sub>
  </td>
</tr>
</table>

<details>
<summary><b>…and 8 more capabilities</b> — tools, memory, scheduling, and more</summary>

<br/>

- 🌐 **Browser Automation** — Puppeteer-powered search, navigation, and scraping via voice command.
- 💻 **Terminal Tool** — Safe system script execution and command-line task automation.
- 📁 **Filesystem Tool** — Read, write, and inspect local workspace files through natural language.
- 📋 **Clipboard & Notifications** — Native desktop alerts (`node-notifier`) and clipboard interactions.
- 🧮 **Calculator & Memory Engine** — Multi-tier session, long-term, and vector knowledge memory via Supabase.
- 🌤️ **Live Widgets** — Real-time weather, dynamic date/time, interactive Todo manager.
- 📅 **Scheduled Jobs & Cron** — Automated morning digests, reminders, and periodic routines.
- 🔁 **Adaptive Fallback** — Gracefully degrades from local → cloud → browser APIs when services are offline.

</details>

---

<a id="architecture"></a>

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Next.js Frontend                               │
│                         (http://localhost:3000)                             │
│                                                                             │
│   ┌────────────────────┐   ┌────────────────────┐   ┌───────────────────┐   │
│   │   Interactive Orb  │   │     Live Widgets   │   │   Conversation    │   │
│   │ (Listening/Speaking│   │ (Weather/DateTime/ │   │      History      │   │
│   │   State Visuals)   │   │       Todos)       │   │    Transcripts    │   │
│   └────────────────────┘   └────────────────────┘   └───────────────────┘   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / Socket.IO
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Node.js / Express Backend                          │
│                         (http://localhost:3001)                             │
│                                                                             │
│  ┌───────────────────────────────┐     ┌────────────────────────────────┐   │
│  │     Autonomous Agent Core     │     │          Tool Router           │   │
│  │   • Agent Runtime & State     │ ──► │ • BrowserTool (Puppeteer)      │   │
│  │   • Google Gemini Reasoning   │     │ • Terminal & Filesystem Tools  │   │
│  │   • Supabase Persistent Store │     │ • Clipboard & Notifications    │   │
│  └───────────────────────────────┘     └────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────────┬──────────────┘
                       │                                       │
                       ▼                                       ▼
    ┌─────────────────────────────────────┐ ┌─────────────────────────────────┐
    │       Local Voice Intelligence      │ │     Cloud Providers (Optional)  │
    │          (OmniVoice Studio)         │ │                                 │
    │       (http://localhost:3900)       │ │  • Google Gemini API (LLM)      │
    │  • Local Whisper STT Engine         │ │  • Deepgram (Cloud STT)         │
    │  • Local Neural TTS & Voice Cloning │ │  • ElevenLabs (Cloud TTS)       │
    │  • Apple Silicon MPS / CUDA support │ │  • Supabase (Database & Auth)   │
    └─────────────────────────────────────┘ └─────────────────────────────────┘
```

- **Frontend (Next.js 15 + React 18)** — App Router, Tailwind CSS, Radix UI primitives, Zustand state, and GSAP/Framer Motion animations.
- **Backend (Express + TypeScript)** — REST API, Socket.IO real-time bus, agent runtime, and tool router.
- **Agent Core** — Google Gemini reasoning engine with persistent Supabase memory and multi-tool execution.
- **Voice Stack** — OmniVoice Studio for 100% local operation; Deepgram & ElevenLabs as optional cloud enhancements.

---

<a id="quickstart"></a>

## 🚀 Quickstart

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| **Node.js** | `18.0.0+` | LTS recommended |
| **npm** | `9.0.0+` | Ships with Node.js 18+ |
| **OmniVoice Studio** *(optional)* | latest | For local voice AI at `localhost:3900` |

### 1. Installation

```bash
git clone https://github.com/your-username/Vocalis.git
cd Vocalis
npm install
```

### 2. Environment Setup

```bash
cp .env.local.example .env.local
```

Populate `.env.local`:

```env
# ── Server ──
PORT=3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# ── AI Brain (Required) ──
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# ── Local Voice (Optional) ──
OMNIVOICE_URL=http://localhost:3900

# ── Cloud Voice (Optional) ──
DEEPGRAM_API_KEY=your_deepgram_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM

# ── Memory (Optional) ──
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ── Widgets (Optional) ──
WEATHER_API_KEY=your_weather_api_key
```

### 3. Run

```bash
npm run dev:all
```

| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:3001 |
| **Health Check** | http://localhost:3001/api/health |

---

## 🛠️ Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev:all` | Runs Next.js frontend + Express backend concurrently |
| `npm run dev` | Starts Next.js dev server on `localhost:3000` |
| `npm run server` | Starts Express backend on `localhost:3001` |
| `npm run build` | Builds Next.js production bundle |
| `npm run start` | Runs Next.js production server |
| `npm run type-check` | TypeScript check (`tsc --noEmit`) |
| `npm run lint` | ESLint analysis |
| `npm run format` | Prettier formatting |

---

<a id="voice-commands"></a>

## 🗣️ Voice Commands

Activate Vocalis by clicking the **Orb** or triggering voice detection.

### Navigation & Search
- *"Open YouTube"* · *"Open WhatsApp Web"* · *"Open Google"* · *"Open ChatGPT"*
- *"Search for quantum computing breakthroughs"*
- *"Search for recipe ideas on Google"*

### Task & Memory
- *"Add todo: Review project architecture"*
- *"Create task: Call John at 4 PM"*
- *"Read my todos"* · *"Clear all completed tasks"*
- *"Remember that my favorite programming language is TypeScript"*

### Information & Digest
- *"What's the weather today?"*
- *"Tell me the date and time"*
- *"Give me my morning digest"*

### Conversation
- *"Tell me a funny joke"*
- *"Tell me an interesting science fact"*
- *"Who are you and what tools do you have?"*

---

<a id="project-structure"></a>

## 📂 Project Structure

```
Vocalis/
├── app/                      # Next.js 15 App Router
│   ├── api/                  # Frontend API route proxies
│   ├── page.tsx              # Main dashboard with voice orb
│   └── layout.tsx            # Root layout & providers
├── backend/                  # Express + TypeScript engine
│   ├── agents/               # Agent runtime & persistence
│   ├── api/                  # REST endpoints
│   ├── core/                 # Tool router & AI OS primitives
│   ├── jobs/                 # Cron background jobs
│   ├── services/             # Voice & memory services
│   ├── tools/                # Executable tools
│   ├── websocket/            # Socket.IO handler
│   └── server.ts             # Entrypoint (port 3001)
├── components/               # React UI library (shadcn/ui + custom)
├── contexts/                 # React Contexts
├── hooks/                    # Custom React hooks
├── lib/                      # Audio processing & utilities
├── public/                   # Static assets
├── styles/                   # Global CSS & Tailwind
└── types/                    # Shared TypeScript declarations
```

---

## ⚖️ Vocalis vs Others

| | **Siri / Google Assistant** | **Vocalis** |
|---|---|---|
| **Privacy** | Audio sent to cloud | **Local-first** — voice stays on your machine |
| **Custom Tools** | Closed ecosystem | **Open tool router** — browser, terminal, filesystem, clipboard |
| **Agent Reasoning** | Rule-based | **Gemini-powered** autonomous agent with persistent memory |
| **Voice Cloning** | ❌ | ✅ Via OmniVoice Studio (3-sec clip, zero-shot) |
| **Extensibility** | ❌ Closed | ✅ Fork it, add tools, swap models |
| **API Keys** | Required (implicit) | **Optional** — runs fully offline without cloud keys |
| **Cost** | Free (data as payment) | **Free & open-source** (MIT) |

---

<a id="faq"></a>

## ❓ FAQ

<details>
<summary><b>Does it work without an internet connection?</b></summary>
<br/>
<b>Yes.</b> If you have OmniVoice Studio running locally on <code>localhost:3900</code>, Vocalis operates entirely offline for voice recognition, synthesis, and agent reasoning (via local Gemini API or cached models). Cloud providers (Deepgram, ElevenLabs) are optional enhancements.
</details>

<details>
<summary><b>Do I need a GPU?</b></summary>
<br/>
<b>No.</b> OmniVoice Studio runs on CPU (slower), Apple Silicon MPS, or NVIDIA CUDA. Vocalis itself is a lightweight Node.js/Next.js app that runs on any modern laptop. For real-time local STT, Apple Silicon or a CUDA GPU is recommended.
</details>

<details>
<summary><b>How is this different from a regular voice assistant?</b></summary>
<br/>
Traditional assistants are <b>reactive</b> — they respond to commands. Vocalis is <b>agentic</b> — it plans, uses tools, persists memory across sessions, and can execute multi-step workflows (e.g., "Research X, save a summary to my workspace, and remind me tomorrow").
</details>

<details>
<summary><b>Can I add my own tools?</b></summary>
<br/>
<b>Yes.</b> The tool router in <code>backend/tools/</code> is modular. Subclass the base tool interface, register it in the router, and the agent can invoke it via natural language. See the existing tools (Browser, Terminal, Filesystem) as templates.
</details>

---

## 🌐 Browser Support

| Browser | Version | Notes |
|---|---|---|
| Chrome | 80+ | Full support — recommended |
| Edge | 80+ | Full support |
| Safari | 14.1+ | Full support |
| Firefox | 90+ | Full support |

> **Microphone access** requires explicit browser permission. **HTTPS** is required for microphone and Web Speech APIs in production.

---

## 📄 License

Created by **Rachit** — All rights reserved.

For feature requests, feedback, or issues, please [open an issue](https://github.com/your-username/Vocalis/issues).

---

<div align="center">

<br/>

If Vocalis speaks to you, give it a star.<br/>
<b>⭐ <a href="https://github.com/your-username/Vocalis">Star this repo</a></b> — it helps others find it.

<br/>

</div>
