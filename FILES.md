# ClawSync File Structure

Brief descriptions of key files in the ClawSync codebase.

## Root

| File | Description |
|------|-------------|
| `CLAUDE.md` | Project instructions for Claude Code AI assistant |
| `README.md` | Project documentation with setup and deployment guides |
| `features.html` | Standalone HTML features page for marketing |
| `docs.html` | Comprehensive documentation with multi-agent system docs |
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
| `media.ts` | Convex native file storage (upload URL, save, list, delete, stats) |
| `r2Storage.ts` | Cloudflare R2 storage integration (optional, via @convex-dev/r2) |
| `stagehand.ts` | Stagehand job storage (mutations/queries for browser automation jobs) |
| `stagehandActions.ts` | Stagehand browser automation actions (Node.js: extract, act, observe, agent) |
| `firecrawl.ts` | Firecrawl web scraping component (exposeApi wrapper with auth) |
| `analytics.ts` | Internal metrics snapshot aggregation for AI analytics |
| `analyticsReport.ts` | AI analytics report storage, listing, and manual trigger |
| `analyticsReportAction.ts` | AI analytics report generation action (Node.js: calls Anthropic/OpenAI) |
| `analyticsCron.ts` | Cron job for weekly AI analytics report generation |
| `research.ts` | Research project and findings CRUD (queries/mutations) |
| `researchActions.ts` | Research execution actions (Node.js: competitive, topic, realtime, API) |
| `skillsMarketplace.ts` | Skills marketplace source management, browsing, activation (queries/mutations) |
| `skillsMarketplaceActions.ts` | Skills marketplace sync action (Node.js: fetches from GitHub, registries) |
| `supermemory.ts` | Supermemory config queries and mutations |
| `supermemoryActions.ts` | Supermemory actions (Node.js: add/search memories, store conversations) |
| `agents.ts` | Multi-agent CRUD (list, get, create, update, remove, reorder, status/mode control) |
| `souls.ts` | Shared soul document CRUD (list, get, create, update, remove) |
| `agentAssignments.ts` | Per-agent skill and MCP server assignment management |
| `agentInteractions.ts` | Agent-to-agent interaction logging and retrieval |

### convex/agent/

| File | Description |
|------|-------------|
| `clawsync.ts` | Agent definition with `createDynamicAgent(ctx, agentId?)` factory supporting multi-agent |
| `security.ts` | Security checker (runs on every tool invocation) |
| `toolLoader.ts` | Assembles tools from skills + MCP servers, scoped per-agent with agent-to-agent interaction tools |
| `modelRouter.ts` | Resolves provider + model from agentConfig or per-agent config (supports anthropic, openai, xai, openrouter, custom) |

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
| `SyncBoardMedia.tsx` | Media file manager (upload, list, delete with Convex or R2) |
| `SyncBoardStagehand.tsx` | Stagehand browser automation interface |
| `SyncBoardFirecrawl.tsx` | Firecrawl web scraping interface |
| `SyncBoardResearch.tsx` | Research project manager (competitive, topic, realtime, API) |
| `SyncBoardAnalytics.tsx` | AI analytics report viewer and manual trigger |
| `SyncBoardMemory.tsx` | Supermemory configuration and memory management |
| `SyncBoardAgents.tsx` | Multi-agent list view with create form |
| `SyncBoardAgentDetail.tsx` | Agent detail config (soul, model, skills, MCP, activity tabs) |
| `SyncBoardSouls.tsx` | Shared soul document management |
| `SyncBoardAgentFeed.tsx` | Unified activity feed across all agents |

### src/components/

| File | Description |
|------|-------------|
| `chat/ChatWindow.tsx` | Chat window with message rendering |
| `chat/ChatInput.tsx` | Message input with send button |
| `chat/MessageList.tsx` | Scrollable message list |
| `syncboard/SyncBoardLayout.tsx` | Admin sidebar layout with navigation |
| `syncboard/SyncBoardLayout.css` | Sidebar and layout styles |
| `agents/AgentCard.tsx` | Agent summary card with status, model, and inline controls |
| `agents/AgentControls.tsx` | Agent operational controls (run, pause, restart, single task, think to continue) |
| `agents/AgentSelector.tsx` | Agent picker dropdown for chat header |
| `agents/AgentFeedItem.tsx` | Activity feed entry with agent badge and action icon |

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

## clawsynclanding/dist/

| File | Description |
|------|-------------|
| `index.html` | Production landing page with features grid and challenge section |
| `docs.html` | Production documentation with multi-agent system docs |
| `features.html` | Production features page (mirrors root features.html) |
