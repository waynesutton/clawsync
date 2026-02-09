# Changelog

All notable changes to ClawSync are documented here.

## [Unreleased]

### Added
- `convex/xTwitterActions.ts` for Node.js runtime X/Twitter actions (split from xTwitter.ts)
- `threads.create` internal mutation for HTTP API thread creation
- Streaming message subscription via `convex/messages.ts` using `listMessages` + `syncStreams` from `@convex-dev/agent`
- Frontend real-time message updates with `useThreadMessages` hook from `@convex-dev/agent/react`
- Tool call display in chat UI with expandable cards showing input and output
- Knowledge-lookup template executor for knowledge base skills
- MCP server tool proxy with SSE `Accept` headers in `toolLoader.ts`
- Dynamic agent factory (`createDynamicAgent`) for runtime model and tool resolution
- xAI (Grok) provider support in model router
- Voice queries split to `convex/voice/queries.ts` to fix `'use node'` conflicts

### Changed
- Upgraded `@ai-sdk/anthropic` from v1 to v2.0.59, `@ai-sdk/openai` to v2.0.89, `@ai-sdk/openai-compatible` to v1.0.32
- Agent definition uses `languageModel` instead of `chat` (correct `@convex-dev/agent` API)
- Tool creation uses `createTool` from `@convex-dev/agent` with `jsonSchema()` (fixes Anthropic `input_schema.type` error)
- Model router uses `LanguageModel` type from `ai@5` (replaces deprecated `LanguageModelV1`)
- Thread API destructuring updated for `@convex-dev/agent` return format
- Threads management rewritten to use `@convex-dev/agent` component API (no direct table queries)
- MCP `listResources`/`readResource` converted from `internalQuery` to `internalAction` (they use `fetch`)
- Simplified `auth.config.ts` to empty providers (removed dead WorkOS placeholder)
- `convex/_generated/` added to `.gitignore`

### Fixed
- `xTwitter.ts`: Removed `'use node'` directive, split actions to `xTwitterActions.ts` (mutations cannot run in Node.js)
- `voice/providers.ts`: Extracted handlers with explicit return types to break circular type references through `internal.voice`
- `voice/providers.ts`: Fixed spread type errors (ternary instead of `&&` for conditional object spreads)
- `chat.ts`: Added explicit type annotations to break circular type inference on `config`, `system`, `result`
- `mcp/client.ts`: Fixed circular types with `as any` on function references and `Response` type on fetch
- `mcp/server.ts`: Simplified httpAction helper signatures, added explicit type annotations
- `mcp.ts`: Cast `skill` argument for `checkSecurity` to match expected `Doc` type
- `agent/modelRouter.ts`: Fixed deep type instantiation on `internal.agentConfig.getConfig`
- `agent/toolLoader.ts`: Fixed deep type instantiation on `api.mcpServers.getEnabledApproved`
- `http.ts`: Fixed `threads.list` call to use `paginationOpts` instead of `limit`
- `http.ts`: Fixed `threads.create` call to use `title` instead of non-existent `metadata`
- `apiKeys.ts`: Fixed readonly array assignment by spreading into mutable arrays
- `mcpServers.ts`: Added `getByIdInternal` as `internalQuery` for secure internal access
- `threads.ts`: Added `create` internal mutation with correct `createThread` return type handling
- Added `returns` validators to all functions missing them across `xTwitter.ts`, `voice/providers.ts`, `mcp/client.ts`, `mcp.ts`
- Added `return null` to handlers with `returns: v.null()` in `xTwitter.ts`
- `agentMail.ts`: `api.activityLog.log` changed to `internal.activityLog.log` (was runtime crash)
- `xTwitter.ts`: `getConfigInternal` changed from `query` to `internalQuery` (was runtime crash)
- `execute.ts`: string function reference replaced with `internal.skillSecrets.getBySkill` (was runtime crash)
- `threads.ts`: removed queries against non-existent component tables
- `modelProviders.ts`: `.filter()` replaced with `.withIndex('by_enabled')` for query performance
- `agentMail.ts`: `.collect()` replaced with `.take(100)` to prevent unbounded table scans
- `chat.ts`: safe optional chaining for token usage (`usage?.promptTokens`)
- `toolLoader.ts`: tool names sanitized to match Anthropic pattern `^[a-zA-Z0-9_-]{1,128}`
- Added `returns` validators to functions in `activityLog.ts`, `agentConfig.ts`, `setup.ts`, `syncboardAuth.ts`, `skillInvocations.ts`, `chat.ts`
- Skill creation UX: template description shown as placeholder, knowledge content textarea for knowledge-lookup

### Security
- Added `by_enabled` index on `modelProviders` table for efficient queries

#### Documentation (prior)
- Created comprehensive `docs.html` with Mintlify-inspired design
- Sidebar navigation with section categories
- View as Markdown and Copy Markdown buttons
- Full setup guides for Convex, WorkOS, APIs, MCP, SyncBoard
- Step-by-step quickstart with numbered progress
- Environment variables reference tables
- Model providers comparison
- Skills system documentation
- Channel integration guides
- Production checklist

#### Landing Page
- Created public landing page at `/` with hero section, features grid, and call-to-action
- Added real-time public activity feed showing agent actions
- Added X/Twitter tweets display section for agents with X integration
- Added quickstart guide with command examples

#### X/Twitter Integration
- New `xTwitter.ts` backend with full X API v2 support
- Read tweets, reply to mentions, post tweets from agent
- OAuth 1.0a authentication for posting, Bearer Token for reading
- SyncBoard X configuration page (`/syncboard/x`)
- Toggle features: auto-reply, post from agent, show tweets on landing
- Tweet caching and management in SyncBoard
- New database tables: `xConfig`, `xTweets`

#### xAI (Grok) Model Support
- Added xAI as model provider in setup wizard
- Grok 3 and Grok 3 Fast model options
- Environment variable: `XAI_API_KEY`

#### SyncBoard Authentication
- Password-based authentication for SyncBoard admin
- Session tokens with expiration
- SHA-256 password hashing
- Login page with logo and flat design
- Logout functionality in sidebar

#### WorkOS AuthKit Preparation
- Created `auth.config.ts` placeholder for JWT validation
- Added provider setup comments in `main.tsx` and `App.tsx`
- `SyncBoardAuthGuard` component ready for WorkOS integration

#### Design System Updates
- Integrated Geist fonts from Vercel (via jsdelivr CDN)
- Removed all gradients for flat, modern UI
- Consistent use of design tokens from `tokens.css`
- Logo fallback pattern (SVG with PNG fallback)

#### Documentation
- Standalone `features.html` page for marketing
- Updated README with X integration section
- Updated README with xAI models section
- Added logo to README header
- Created FILES.md with file descriptions
- Created CHANGELOG.md
- Created TASK.md for progress tracking

#### ClawSync Challenge
- Added challenge section on features.html
- $500 prize for first 3 live demos posted on X
- Requirements: show at least 3 agent features
- Dark background with trophy icon

#### AgentMail Integration
- New `convex/agentMail.ts` backend with full API support
- Create, manage, and delete email inboxes
- Send and receive emails via AgentMail API
- Rate limiting per hour configurable in SyncBoard
- Auto-reply and forward-to-agent options
- Message logging and tracking
- New database tables: `agentMailConfig`, `agentMailInboxes`, `agentMailMessages`
- SyncBoard AgentMail page (`/syncboard/agentmail`)
- MCP integration for agent email tools

#### Icon System
- Replaced all emojis with Phosphor icons (@phosphor-icons/react)
- Updated LandingPage.tsx with Phosphor icons for features and activity
- Updated SyncBoardLayout.tsx sidebar navigation with Phosphor icons
- Updated SyncBoard.tsx navigation with Phosphor icons
- Updated SyncBoardChannels.tsx with brand logos (Telegram, Discord, etc.)
- Updated SyncBoardActivity.tsx with Phosphor icons
- Updated ActivityFeed.tsx with Phosphor icons
- Updated SyncBoardSkillNew.tsx with Phosphor icons
- Updated SetupWizard.tsx with HandWaving and Check icons
- Updated features.html with inline SVG Phosphor icons

### Changed

- features.html logo increased from 36px to 54px
- features.html hero description text reduced from 1.25rem to 1rem
- features.html docs links now point to docs.html instead of GitHub README
- Removed all emojis from React components and static HTML
- Commented out Self-Hosted feature card on features.html
- Removed "No Vercel or Netlify required" messaging from README and docs
- Renamed docs.html "Self Hosting" section to "Deployment"
- Setup wizard now uses logo image instead of text
- Login page uses logo image instead of text
- SyncBoard sidebar includes logo and X navigation item
- All pages use flat backgrounds (no gradients)
- Favicon changed from ICO to PNG format

### Fixed

- Geist fonts now load correctly via jsdelivr CDN (not Google Fonts)
- Logo fallback to PNG when SVG fails to load

### Security

- SyncBoard routes protected by authentication guard
- Password hashes stored in environment variables
- Session tokens expire after configured duration
- X API credentials stored in Convex environment variables

---

## [0.1.0] - Initial Release

### Added

- Core AI agent with @convex-dev/agent
- Real-time chat with streaming responses
- Multi-model support (Claude, GPT, Gemini via OpenRouter)
- Skills system (template, webhook, code-based)
- MCP server integration
- SyncBoard admin dashboard
- Soul document customization
- Activity logging
- Thread management
- Rate limiting with @convex-dev/rate-limiter
- Action caching with @convex-dev/action-cache
- Convex Self Static Hosting support
