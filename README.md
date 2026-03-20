# LocalGPT (Tauri Desktop App)

A production-quality local ChatGPT/Claude-style desktop application, natively integrated with [Ollama](https://ollama.ai) using Tauri.

## Prerequisites

- **Node.js** v18+ (for development)
- **Rust** (for Tauri builds if compiling native binaries)
- **Ollama** running locally at `http://localhost:11434`
- At least one model pulled (`ollama pull llama3`, `ollama pull phi3`, etc.)

## Quick Start (Development)

1. Make sure Ollama is running:
   ```bash
   ollama serve
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Tauri development app (opens the desktop window):
   ```bash
   npm run tauri dev
   ```

## Architecture

This project has been transformed from a typical React+Node web app to a **pure desktop app**.
The native Windows/macOS/Linux Tauri shell wraps the React frontend, which communicates **directly** with the local Ollama API (`http://localhost:11434`). This skips the Node backend, drastically reducing latency and memory usage.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Tauri (Rust) |
| Frontend | React + Vite + TailwindCSS v4 |
| LLM API | Ollama (Local Fetch Streaming) |
| Storage | `localStorage` |

## Features

- 🎨 **Dark mode UI** matching ChatGPT/Claude aesthetic
- 🔄 **Native streaming responses** directly from Ollama
- 📝 **Markdown rendering** with syntax-highlighted code blocks
- 📋 **Copy-to-clipboard** on code blocks
- 🔄 **Regenerate response** button
- 💾 **Conversation persistence** (localStorage)
- 🤖 **Dynamic model selection** (fetched directly from Ollama)
- ⚡ **Response metadata** (time, token count, tokens/sec)
- ✨ **Prompt templates** (explain code, write tests, debug, etc.)
- ⌨️ **Keyboard shortcuts** (Cmd+K new chat, Cmd+Shift+⌫ clear)

## Project Structure

```text
localGPT/
├── src-tauri/                 # Tauri native configuration and Rust code
│   └── tauri.conf.json        # Tauri settings and HTTP allowgroups
├── src/                       # React Frontend
│   ├── components/            # UI components (Sidebar, ChatArea, etc.)
│   ├── hooks/                 # State management (useChat, useModels)
│   ├── services/
│   │   └── api.js             # Direct Ollama fetch & stream logic
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── vite.config.js             # Basic Vite settings
└── package.json               # Project scripts (npm run tauri dev)
```

## Build for Production

To create a standalone native application (macOS `.app` / `.dmg`, Windows `.exe`, or Linux `.deb`):

```bash
npm run tauri build
```
*(Requires full Rust & Xcode/C++ toolchain to compile.)*
