# ClawSync Task Tracker

## Completed Tasks

### Full TypeScript Strict Pass (2026-02-10)

- [x] Fixed all remaining TypeScript errors across 13 backend and frontend files
- [x] Backend: prefixed unused params with `_` in agentMail, http, mcp, mcp/server, xTwitterActions
- [x] Backend: removed unused imports in api/auth.ts and skillInvocations.ts
- [x] Frontend: removed explicit `{ _id: string }` type annotations from map callbacks in 5 SyncBoard pages
- [x] Frontend: removed unused ArrowsClockwise import in SyncBoardAgentMail.tsx
- [x] `npx convex codegen` passes clean
- [x] `npx tsc --noEmit` passes with zero errors

### SyncBoard Feature Expansion (2026-02-09)

- [x] Media file manager (Convex native default, R2 optional)
  - `convex/media.ts` (upload URL, save, list, delete, stats)
  - `convex/r2Storage.ts` (R2 presigned upload, save, URL retrieval)
  - `src/pages/SyncBoardMedia.tsx` frontend
- [x] Stagehand browser automation
  - `convex/stagehand.ts` (job storage queries/mutations)
  - `convex/stagehandActions.ts` (Node.js extract, act, observe, agent)
  - `src/pages/SyncBoardStagehand.tsx` frontend
- [x] Firecrawl web scraping
  - `convex/firecrawl.ts` (exposeApi with auth wrapper)
  - `src/pages/SyncBoardFirecrawl.tsx` frontend
- [x] AI Analytics reports
  - `convex/analytics.ts` (metrics snapshot aggregation)
  - `convex/analyticsReport.ts` (report CRUD, manual trigger)
  - `convex/analyticsReportAction.ts` (Node.js AI generation)
  - `convex/analyticsCron.ts` (weekly Monday 7AM UTC cron)
  - `src/pages/SyncBoardAnalytics.tsx` frontend
- [x] Research projects
  - `convex/research.ts` (project/findings/sources CRUD)
  - `convex/researchActions.ts` (Node.js: competitive, topic, realtime, API)
  - `src/pages/SyncBoardResearch.tsx` frontend
- [x] Skills marketplace
  - `convex/skillsMarketplace.ts` (source management, browse, activate/deactivate)
  - `convex/skillsMarketplaceActions.ts` (Node.js sync from GitHub, registries)
  - Updated `src/pages/SyncBoardSkills.tsx` with Browse and Sources tabs
- [x] Supermemory persistent agent memory
  - `convex/supermemory.ts` (config queries/mutations)
  - `convex/supermemoryActions.ts` (Node.js: add, search, store, inject)
  - `src/pages/SyncBoardMemory.tsx` frontend
  - Integrated into `convex/chat.ts` for auto-inject and auto-store
- [x] Schema expanded with 9 new tables
- [x] Convex component registrations (r2, stagehand, firecrawl)
- [x] SyncBoard navigation updated with 6 new nav items
- [x] App.tsx routes added for all new pages
- [x] .env.example updated with all new env vars
- [x] FILES.md, CHANGELOG.md, TASK.md updated
- [x] Convex codegen passes clean
- [x] Zero new TypeScript errors introduced

### Phase 0: Fork Owner MVP

- [x] SyncBoard password protection
  - Created `convex/syncboardAuth.ts` with login/logout mutations
  - Created `src/pages/SyncBoardLogin.tsx` login page
  - Added `SyncBoardAuthGuard` component in `App.tsx`
  - Wrapped all SyncBoard routes with auth guard

- [x] WorkOS AuthKit preparation (placeholders only)
  - Created `convex/auth.config.ts` with JWT validation skeleton
  - Added provider comments in `src/main.tsx`
  - Added AuthKit comments in `src/App.tsx`

- [x] First-run setup wizard
  - Setup wizard at `/setup` route
  - Steps: Welcome → Name → Soul → Model → Preview → Complete
  - Auto-redirect to chat on completion

- [x] Landing page
  - Created `src/pages/LandingPage.tsx`
  - Hero section with logo and CTA
  - Features grid
  - Public activity feed
  - X/Twitter tweets section
  - Quickstart commands
  - Footer

- [x] Design system updates
  - Integrated Geist fonts via jsdelivr CDN
  - Removed all gradients (flat UI)
  - Updated `index.html` with font links
  - Updated `src/styles/tokens.css` with font family

### X/Twitter Integration

- [x] Backend implementation
  - Created `convex/xTwitter.ts` with queries, mutations, actions
  - X API v2 integration with OAuth 1.0a
  - Tweet CRUD operations
  - Mention fetching
  - Activity logging

- [x] Database schema
  - Added `xConfig` table for settings
  - Added `xTweets` table for cached tweets
  - Added indexes for efficient queries

- [x] SyncBoard UI
  - Created `src/pages/SyncBoardX.tsx`
  - Toggle switches for features
  - API credentials info section
  - Tweet management with landing visibility toggle
  - Added X to sidebar navigation

- [x] Landing page integration
  - Tweets display on landing page when configured
  - Show/hide individual tweets from landing

### xAI (Grok) Support

- [x] Provider setup
  - Added xAI provider to `convex/setup.ts` seed data
  - Added Grok 3 and Grok 3 Fast models

- [x] Setup wizard
  - Added Grok models to model selection
  - Shows `XAI_API_KEY` requirement

### Documentation

- [x] README updates
  - Added centered logo at top
  - Added X/Twitter integration section
  - Added xAI (Grok) models section
  - Updated project structure

- [x] CLAUDE.md updates
  - Added X integration rules
  - Added auth section

- [x] Standalone features page
  - Created `features.html` with all ClawSync features
  - Updated logo size (36px → 48px)
  - Reduced hero description text size
  - Updated docs links to point to docs.html

- [x] Comprehensive documentation page
  - Created `docs.html` with Mintlify-inspired design
  - Sidebar navigation with all sections
  - View as Markdown / Copy Markdown buttons
  - Covers: Quickstart, Project Structure, Convex Setup
  - Covers: Environment Variables, Model Providers, Agent Config
  - Covers: Soul Document, Skills System, MCP Servers
  - Covers: Channels, X/Twitter, SyncBoard, Auth, API Keys
  - Covers: Self Hosting, Production Checklist

- [x] Documentation files
  - Created FILES.md
  - Created CHANGELOG.md
  - Created TASK.md

### UI/UX

- [x] Logo integration
  - Copied logo files to public/
  - Updated SetupWizard to use logo
  - Updated SyncBoardLogin to use logo
  - Updated SyncBoardLayout sidebar with logo
  - Added logo to README
  - Added SVG with PNG fallback pattern

- [x] Flat design
  - Removed all `linear-gradient` from CSS
  - Replaced with solid `var(--bg-primary)`
  - Consistent flat backgrounds throughout

- [x] Phosphor Icons
  - Replaced all emojis with Phosphor icons
  - Updated LandingPage.tsx (features, activity icons)
  - Updated SyncBoardLayout.tsx (sidebar nav)
  - Updated SyncBoard.tsx (sidebar nav)
  - Updated SyncBoardChannels.tsx (brand logos)
  - Updated SyncBoardActivity.tsx (action icons)
  - Updated ActivityFeed.tsx (action icons)
  - Updated SyncBoardSkillNew.tsx (skill type icons)
  - Updated SetupWizard.tsx (welcome and complete icons)
  - Updated features.html (inline SVG icons)

- [x] ClawSync Challenge section
  - Added to features.html above "Everything you need"
  - $500 prize, swag, credits for first 3 live demos
  - Dark background with trophy icon
  - Requirements: at least 3 agent features on X

- [x] Deployment messaging cleanup
  - Commented out Self-Hosted feature card on features.html
  - Removed "No Vercel or Netlify required" from README.md
  - Removed "No Vercel or Netlify required" from docs.html
  - Renamed "Self Hosting" section to "Deployment" in docs.html

- [x] AgentMail Integration
  - Created `convex/agentMail.ts` with queries, mutations, actions
  - Created `src/pages/SyncBoardAgentMail.tsx` UI page
  - Added schema tables: `agentMailConfig`, `agentMailInboxes`, `agentMailMessages`
  - Added to SyncBoardLayout navigation
  - Added route in App.tsx
  - Added to features.html and README.md
  - Features: create/delete inboxes, send/receive emails, rate limits
  - MCP tools available for agent email operations

### Deep Audit and PR #1 Merge

- [x] Deep audit of entire codebase for errors, issues, and bugs
  - Identified 10+ critical, moderate, and minor issues across backend
  - Runtime crashes from wrong internal/public function references
  - Missing `returns` validators on Convex functions
  - Unbounded table scans and `.filter()` instead of indexes

- [x] Fix all audit issues
  - Fixed `agentMail.ts` api.activityLog.log to internal (3 places)
  - Fixed `xTwitter.ts` getConfigInternal from query to internalQuery
  - Fixed `execute.ts` string function ref to proper internal reference
  - Fixed `modelProviders.ts` .filter() to .withIndex('by_enabled')
  - Fixed `agentMail.ts` .collect() to .take() limits
  - Added `returns` validators to 7 backend files
  - Added xAI provider to model router and seed data

- [x] Merge PR #1: Fix AI SDK compatibility, tool loading, and skill system
  - Merged `fix/ai-sdk-compat-and-streaming` branch into main
  - Resolved 3 merge conflicts (clawsync.ts, chat.ts, threads.ts)
  - Combined dynamic agent factory with PR's `languageModel` API fix
  - Combined thread destructuring fix with dynamic model resolution
  - AI SDK upgraded: anthropic v2, openai v2, openai-compatible v1

- [x] Post-merge type safety fixes
  - Fixed `LanguageModelV1` to `LanguageModel` in modelRouter (ai@5 migration)
  - Fixed `jsonSchema` typing with generic params in toolLoader
  - Fixed `result as Record` cast in chat.ts
  - Ran `npm install` to sync installed packages with package.json

### TypeScript strict type safety pass (44 errors to 0)

- [x] Fix `xTwitter.ts` Node.js runtime conflict
  - Removed `'use node'` (mutations/queries must run in V8)
  - Split actions to new `convex/xTwitterActions.ts` with `'use node'`
  - Added `return null` to handlers with `returns: v.null()`

- [x] Fix `voice/providers.ts` circular type references (10 errors)
  - Extracted `handleTextToSpeech` and `handleSpeechToText` into standalone functions with explicit return types
  - Used `as any` on `internal.voice.queries.*` function references
  - Fixed spread type errors with ternary patterns

- [x] Fix `chat.ts` implicit any types (5 errors)
  - Added explicit type annotations to `config`, `system`, `result` variables
  - Replaced `stepCountIs` import with `maxSteps` option

- [x] Fix `mcp/client.ts` circular types (3 errors)
  - Removed invalid module augmentation
  - Added `as any` on function references, explicit `Response` type
  - Changed `getById` to `getByIdInternal` (internalQuery)

- [x] Fix `mcp/server.ts` complex type inference (6 errors)
  - Simplified httpAction helper signatures
  - Added explicit type annotations on `body` and `skills` arrays

- [x] Fix `http.ts` implicit any and wrong args (2 errors)
  - Added type annotations to `.map()` callbacks
  - Fixed `threads.list` to use `paginationOpts`
  - Fixed `threads.create` args

- [x] Fix `mcp.ts` type mismatch (1 error)
  - Cast `skill as any` for `checkSecurity` call

- [x] Fix `apiKeys.ts` readonly array (1 error)
  - Spread `API_SCOPES` arrays into mutable arrays

- [x] Fix `agent/modelRouter.ts` deep type instantiation (1 error)
  - `@ts-expect-error` on `internal.agentConfig.getConfig`

- [x] Fix `agent/toolLoader.ts` deep type instantiation (1 error)
  - `@ts-expect-error` on `api.mcpServers.getEnabledApproved`

- [x] Add `threads.create` internal mutation
  - Uses `components.agent.threads.createThread`
  - Returns `{ threadId: thread._id }`

- [x] Add `mcpServers.getByIdInternal` internalQuery
  - Secure internal-only access for actions

- [x] Verified: `npx convex codegen` passes with 0 errors

---

### Multi-Agent System (2026-02-10)

- [x] Schema: 5 new tables (agents, souls, agentSkillAssignments, agentMcpAssignments, agentInteractions)
- [x] Schema: added agentId field and by_agentId index to activityLog
- [x] Backend: agents.ts CRUD (list, get, create, update, remove, reorder, status/mode control)
- [x] Backend: souls.ts CRUD (list, get, create, update, remove with usage check)
- [x] Backend: agentAssignments.ts per-agent skill and MCP server management
- [x] Backend: agentInteractions.ts logging and retrieval
- [x] Backend: updated createDynamicAgent in clawsync.ts with optional agentId
- [x] Backend: updated toolLoader.ts with per-agent tool scoping and ask_agent tools
- [x] Backend: added resolveModelFromConfig to modelRouter.ts
- [x] Backend: updated chat.ts (send, stream, apiSend) with optional agentId and mode checks
- [x] Backend: updated activityLog.ts with agentId param and listByAgent query
- [x] Backend: updated http.ts with GET /api/v1/agents and agentId in chat endpoint
- [x] Backend: updated setup.ts with auto-migration from agentConfig to multi-agent
- [x] Frontend: AgentCard, AgentControls, AgentSelector, AgentFeedItem components
- [x] Frontend: SyncBoardAgents page with agent list and create form
- [x] Frontend: SyncBoardAgentDetail page with tabbed configuration
- [x] Frontend: SyncBoardSouls page for shared soul management
- [x] Frontend: SyncBoardAgentFeed page with unified timeline and filters
- [x] Frontend: ChatPage updated with AgentSelector and agent switching
- [x] Frontend: AgentChat updated to pass agentId to backend
- [x] Frontend: SyncBoardLayout nav updated with Agents, Souls, Agent Feed links
- [x] Frontend: App.tsx routes for all new pages
- [x] features.html updated with Multi-Agent, Shared Souls, Agent Controls cards
- [x] clawsynclanding/dist/index.html updated with new feature cards
- [x] Convex codegen passes with 0 new errors
- [x] TypeScript strict check passes (no new errors from multi-agent changes)

### Documentation Updates (2026-02-10)

- [x] Added Multi-Agent System section to clawsynclanding/dist/docs.html (sidebar nav, full section with controls table, shared souls, per-agent assignments, agent-to-agent interaction, activity feed, database tables, API, backward compat callout)
- [x] Added Multi-Agent System section to root docs.html (identical changes)
- [x] Updated SyncBoard sections table in both docs files with Agents, Souls, Agent Feed rows
- [x] Updated Database Schema section in both docs files with Multi-Agent tables subsection
- [x] Updated embedded markdown content in both docs files
- [x] Verified features.html and clawsynclanding/dist/index.html are in sync (17 feature cards)
- [x] Updated FILES.md with clawsynclanding/dist/ section
- [x] Updated CHANGELOG.md with docs changes
- [x] `npx tsc --noEmit` passes with zero errors

## In Progress

_None currently_

---

## Pending Tasks

### Phase 1: Security

- [ ] Implement AES-256-GCM encryption in `convex/lib/encryption.ts`
- [ ] Add JSON Schema validation to security checker
- [ ] Integrate rate limiter properly

### Phase 2: Channel Integrations

- [ ] Telegram webhook implementation
- [ ] Discord webhook implementation
- [ ] WhatsApp (Twilio) integration
- [ ] Slack Events API integration
- [ ] Email inbound webhook

### Phase 3: Skills System

- [ ] Complete webhook skill execution with secrets
- [ ] Implement code skill loading
- [ ] Complete MCP server integration

### Phase 4: Voice (Optional)

- [ ] ElevenLabs TTS implementation
- [ ] Personaplex TTS/STT implementation
- [ ] Voice UI components

---

## Notes

- TypeScript types are generated dynamically by Convex dev server
- Run `npx convex dev` before `npm run typecheck` to generate types
- All new code follows flat UI design (no gradients)
- Logo uses SVG with PNG fallback pattern
