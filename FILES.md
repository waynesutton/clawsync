# ClawSync File Structure

Brief descriptions of key files in the ClawSync codebase.

## Root

| File | Description |
|------|-------------|
| `CLAUDE.md` | Project instructions for Claude Code AI assistant |
| `README.md` | Project documentation with setup and deployment guides |
| `features.html` | Standalone HTML features page for marketing |
| `docs.html` | Comprehensive documentation with Mintlify-inspired design |
| `package.json` | Node.js dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite bundler configuration |
| `index.html` | HTML entry point with Geist fonts |

## convex/ (Backend)

| File | Description |
|------|-------------|
| `schema.ts` | Database schema defining all tables and indexes |
| `convex.config.ts` | Component registration (agent, rate-limiter, action-cache) |
| `http.ts` | HTTP endpoints and webhook handlers |
| `crons.ts` | Background jobs (summaries, health checks, cleanup) |
| `setup.ts` | Seed data and first-run configuration |
| `syncboardAuth.ts` | SyncBoard password authentication |
| `xTwitter.ts` | X/Twitter queries, mutations, internal functions (V8 runtime) |
| `xTwitterActions.ts` | X/Twitter actions: postTweet, fetchMentions, readTweet (Node.js runtime) |
| `agentMail.ts` | AgentMail email integration |
| `auth.config.ts` | Auth configuration (empty providers placeholder) |
| `messages.ts` | Streaming message subscription with `listMessages` + `syncStreams` |

### convex/agent/

| File | Description |
|------|-------------|
| `clawsync.ts` | Agent definition with `languageModel` API and `createDynamicAgent` factory |
| `security.ts` | Security checker (runs on every tool invocation) |
| `toolLoader.ts` | Assembles tools from skills + MCP servers using `createTool` and `jsonSchema` (type-safe API refs) |
| `modelRouter.ts` | Resolves provider + model from agentConfig (supports anthropic, openai, xai, openrouter, custom) |

### convex/voice/

| File | Description |
|------|-------------|
| `providers.ts` | Voice TTS/STT actions with extracted handlers for type safety (ElevenLabs, Personaplex) |
| `queries.ts` | Voice provider queries, session mutations (split from providers for `'use node'`) |

### convex/lib/

| File | Description |
|------|-------------|
| `encryption.ts` | Encryption utilities (AES-256-GCM placeholder) |

## src/ (Frontend)

### src/pages/

| File | Description |
|------|-------------|
| `LandingPage.tsx` | Public landing with hero, features, activity feed, tweets |
| `ChatPage.tsx` | Real-time chat interface with streaming |
| `SetupWizard.tsx` | First-run setup wizard (name, soul, model) |
| `SyncBoardLogin.tsx` | Password login for SyncBoard |
| `SyncBoardOverview.tsx` | Dashboard overview with stats |
| `SyncBoardSoul.tsx` | Soul document editor |
| `SyncBoardModels.tsx` | AI model configuration |
| `SyncBoardSkills.tsx` | Skills management (template, webhook, code) |
| `SyncBoardMCP.tsx` | MCP server configuration |
| `SyncBoardChannels.tsx` | Channel integrations (Telegram, Discord, etc.) |
| `SyncBoardX.tsx` | X/Twitter configuration and tweet management |
| `SyncBoardAgentMail.tsx` | AgentMail inbox and email management |
| `SyncBoardAPI.tsx` | API key management |
| `SyncBoardThreads.tsx` | Conversation thread viewer |
| `SyncBoardActivity.tsx` | Activity log viewer |
| `SyncBoardConfig.tsx` | General configuration |

### src/components/

| File | Description |
|------|-------------|
| `chat/ChatWindow.tsx` | Chat window with message rendering |
| `chat/ChatInput.tsx` | Message input with send button |
| `chat/MessageList.tsx` | Scrollable message list |
| `syncboard/SyncBoardLayout.tsx` | Admin sidebar layout with navigation |
| `syncboard/SyncBoardLayout.css` | Sidebar and layout styles |

### src/styles/

| File | Description |
|------|-------------|
| `tokens.css` | Design system CSS custom properties |
| `global.css` | Global styles and resets |

### src/lib/

| File | Description |
|------|-------------|
| `formatters.ts` | Date, number, and text formatting utilities |

### src/hooks/

| File | Description |
|------|-------------|
| `useChat.ts` | Chat state and message handling hook |

## content/

| File | Description |
|------|-------------|
| `soul.md` | Default agent identity document |

## public/

| File | Description |
|------|-------------|
| `clawsync-logo.svg` | Primary logo (SVG) |
| `clawsync-logo.png` | Logo fallback (PNG) |
| `favicon.png` | Browser favicon |

## docs/

| File | Description |
|------|-------------|
| `clawsync-prd.md` | Product requirements document |
| `clawsync-implementation-guide.md` | Implementation guide |
| `clawsync-security-checklist.md` | Security checklist |
| `AGENTS.md` | Instructions for AI coding agents |
| `CLAUDE.md` | Claude-specific project instructions |
