import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { internal, components } from './_generated/api';
import {
  authenticateRequest,
  getCorsHeaders,
  jsonResponse,
  errorResponse,
} from './api/auth';
import { registerStaticRoutes } from '@convex-dev/self-static-hosting';

/**
 * HTTP Routes
 *
 * Public API for external integrations:
 * - /api/v1/agent/* - Agent API (chat, threads)
 * - /api/v1/data/* - Data API (skills, activity, config)
 * - /api/v1/mcp/* - MCP API (tools, resources)
 *
 * Channel webhooks:
 * - /api/webhook/* - Telegram, WhatsApp, Slack, Discord, Email
 */

const http = httpRouter();

// ============================================
// CORS Preflight Handler
// ============================================

const handleOptions = httpAction(async (_, request) => {
  const origin = request.headers.get('Origin');
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
});

// Register OPTIONS for all API routes
http.route({ path: '/api/v1/agent/chat', method: 'OPTIONS', handler: handleOptions });
http.route({ path: '/api/v1/agent/threads', method: 'OPTIONS', handler: handleOptions });
http.route({ pathPrefix: '/api/v1/agent/threads/', method: 'OPTIONS', handler: handleOptions });
http.route({ path: '/api/v1/data/skills', method: 'OPTIONS', handler: handleOptions });
http.route({ path: '/api/v1/data/activity', method: 'OPTIONS', handler: handleOptions });
http.route({ path: '/api/v1/data/config', method: 'OPTIONS', handler: handleOptions });
http.route({ path: '/api/v1/data/usage', method: 'OPTIONS', handler: handleOptions });
http.route({ path: '/api/v1/mcp/tools', method: 'OPTIONS', handler: handleOptions });
http.route({ path: '/api/v1/mcp/tools/call', method: 'OPTIONS', handler: handleOptions });
http.route({ path: '/api/v1/mcp/resources', method: 'OPTIONS', handler: handleOptions });

// ============================================
// Health Check
// ============================================

http.route({
  path: '/api/health',
  method: 'GET',
  handler: httpAction(async () => {
    return jsonResponse({
      status: 'ok',
      version: '1.0.0',
      timestamp: Date.now(),
    });
  }),
});

// ============================================
// Agent API
// ============================================

// POST /api/v1/agent/chat - Send a message to the agent
http.route({
  path: '/api/v1/agent/chat',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    // Authenticate
    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['agent:chat'],
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    try {
      const body = await request.json();
      const { message, threadId, sessionId } = body;

      if (!message || typeof message !== 'string') {
        return errorResponse('Missing or invalid message', 400, cors);
      }

      const startTime = Date.now();

      // Call the chat action
      const result = await ctx.runAction(internal.chat.apiSend, {
        message,
        threadId,
        sessionId: sessionId ?? `api_${auth.apiKey?._id}`,
        apiKeyId: auth.apiKey?._id,
      });

      // Log usage
      if (auth.apiKey) {
        await ctx.runMutation(internal.apiUsage.log, {
          apiKeyId: auth.apiKey._id,
          endpoint: '/api/v1/agent/chat',
          method: 'POST',
          statusCode: result.error ? 400 : 200,
          tokensUsed: result.tokensUsed,
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          durationMs: Date.now() - startTime,
          requestSize: message.length,
          responseSize: result.response?.length,
          userAgent: request.headers.get('User-Agent') ?? undefined,
        });
      }

      if (result.error) {
        return errorResponse(result.error, 400, cors);
      }

      return jsonResponse({
        response: result.response,
        threadId: result.threadId,
        tokensUsed: result.tokensUsed,
      }, 200, cors);
    } catch (error) {
      console.error('Chat API error:', error);
      return errorResponse('Internal server error', 500, cors);
    }
  }),
});

// GET /api/v1/agent/threads - List threads
http.route({
  path: '/api/v1/agent/threads',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['agent:threads:read'],
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') ?? '20');

    const threads = await ctx.runQuery(internal.threads.list, {
      paginationOpts: { cursor: null, numItems: limit },
    });

    return jsonResponse({ threads }, 200, cors);
  }),
});

// GET /api/v1/agent/threads/:id - Get thread messages
http.route({
  pathPrefix: '/api/v1/agent/threads/',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['agent:threads:read'],
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    const url = new URL(request.url);
    const threadId = url.pathname.replace('/api/v1/agent/threads/', '');

    if (!threadId) {
      return errorResponse('Missing thread ID', 400, cors);
    }

    const messages = await ctx.runQuery(internal.threads.getMessages, { threadId });

    return jsonResponse({ threadId, messages }, 200, cors);
  }),
});

// POST /api/v1/agent/threads - Create a new thread
http.route({
  path: '/api/v1/agent/threads',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['agent:threads:create'],
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    const body: { title?: string } = await request.json().catch(() => ({}));
    const thread = await ctx.runMutation(internal.threads.create, {
      title: body.title,
    });

    return jsonResponse({ threadId: thread.threadId }, 201, cors);
  }),
});

// ============================================
// Data API
// ============================================

// GET /api/v1/data/skills - List active skills
http.route({
  path: '/api/v1/data/skills',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['data:skills:read'],
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    const skills = await ctx.runQuery(internal.skillRegistry.getActiveApproved);

    // Return public info only
    const publicSkills = skills.map((s: { name: string; description: string; skillType: string; supportsImages?: boolean; supportsStreaming?: boolean }) => ({
      name: s.name,
      description: s.description,
      skillType: s.skillType,
      supportsImages: s.supportsImages,
      supportsStreaming: s.supportsStreaming,
    }));

    return jsonResponse({ skills: publicSkills }, 200, cors);
  }),
});

// GET /api/v1/data/activity - Get public activity
http.route({
  path: '/api/v1/data/activity',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['data:activity:read'],
      allowPublic: true, // Allow unauthenticated access for public activity
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') ?? '20');

    // If authenticated, return all activity; otherwise just public
    const activity = auth.apiKey
      ? await ctx.runQuery(internal.activityLog.listAll, { limit })
      : await ctx.runQuery(internal.activityLog.listPublicOnly, { limit });

    return jsonResponse({ activity }, 200, cors);
  }),
});

// GET /api/v1/data/config - Get agent config
http.route({
  path: '/api/v1/data/config',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['data:config:read'],
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    const config = await ctx.runQuery(internal.agentConfig.getPublic);

    return jsonResponse({ config }, 200, cors);
  }),
});

// GET /api/v1/data/usage - Get API usage stats
http.route({
  path: '/api/v1/data/usage',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['data:usage:read'],
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') ?? '7');

    const summary = await ctx.runQuery(internal.apiUsage.getSummaryForKey, {
      apiKeyId: auth.apiKey!._id,
      days,
    });

    return jsonResponse({ usage: summary }, 200, cors);
  }),
});

// ============================================
// MCP API (Model Context Protocol)
// ============================================

// GET /api/v1/mcp/tools - List available MCP tools
http.route({
  path: '/api/v1/mcp/tools',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['mcp:tools:list'],
      allowPublic: true, // Allow listing tools publicly (like MCP spec)
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    // Get active skills as MCP tools
    const skills = await ctx.runQuery(internal.skillRegistry.getActiveApproved);

    const tools = skills.map((skill: { name: string; description: string; config?: string }) => {
      // Parse config for input schema
      let inputSchema = {};
      try {
        if (skill.config) {
          const config = JSON.parse(skill.config);
          inputSchema = config.inputSchema ?? {};
        }
      } catch {
        // Use empty schema
      }

      return {
        name: skill.name,
        description: skill.description,
        inputSchema,
      };
    });

    return jsonResponse({ tools }, 200, cors);
  }),
});

// POST /api/v1/mcp/tools/call - Call an MCP tool
http.route({
  path: '/api/v1/mcp/tools/call',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['mcp:tools:call'],
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    try {
      const body = await request.json();
      const { name, arguments: args } = body;

      if (!name || typeof name !== 'string') {
        return errorResponse('Missing tool name', 400, cors);
      }

      const startTime = Date.now();

      // Execute the tool
      const result = await ctx.runAction(internal.mcp.executeTool, {
        toolName: name,
        input: args,
        apiKeyId: auth.apiKey?._id,
      });

      // Log usage
      if (auth.apiKey) {
        await ctx.runMutation(internal.apiUsage.log, {
          apiKeyId: auth.apiKey._id,
          endpoint: '/api/v1/mcp/tools/call',
          method: 'POST',
          statusCode: result.error ? 400 : 200,
          durationMs: Date.now() - startTime,
          userAgent: request.headers.get('User-Agent') ?? undefined,
        });
      }

      if (result.error) {
        return errorResponse(result.error, 400, cors);
      }

      return jsonResponse({ result: result.output }, 200, cors);
    } catch (error) {
      console.error('MCP tool call error:', error);
      return errorResponse('Internal server error', 500, cors);
    }
  }),
});

// GET /api/v1/mcp/resources - List MCP resources
http.route({
  path: '/api/v1/mcp/resources',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const origin = request.headers.get('Origin');
    const cors = getCorsHeaders(origin);

    const auth = await authenticateRequest(ctx, request, {
      requiredScopes: ['mcp:resources:read'],
      allowPublic: true,
    });

    if (!auth.valid) {
      return errorResponse(auth.error!, auth.statusCode, cors);
    }

    // Get available resources (knowledge bases, etc.)
    const resources = await ctx.runAction(internal.mcp.listResources);

    return jsonResponse({ resources }, 200, cors);
  }),
});

// ============================================
// Channel Webhooks
// ============================================

// Telegram webhook
http.route({
  path: '/api/webhook/telegram',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // TODO: Implement Telegram webhook handler
    // 1. Verify X-Telegram-Bot-Api-Secret-Token header
    // 2. Parse payload
    // 3. Find/create channel user
    // 4. Run agent
    // 5. Send response via Telegram API
    console.log('Telegram webhook received');
    return jsonResponse({ ok: true });
  }),
});

// WhatsApp/Twilio webhook
http.route({
  path: '/api/webhook/whatsapp',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // TODO: Implement WhatsApp webhook handler
    console.log('WhatsApp webhook received');
    return jsonResponse({ ok: true });
  }),
});

// Slack webhook
http.route({
  path: '/api/webhook/slack',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // TODO: Implement Slack Events API handler
    console.log('Slack webhook received');
    return jsonResponse({ ok: true });
  }),
});

// Discord webhook
http.route({
  path: '/api/webhook/discord',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // TODO: Implement Discord Interactions handler
    console.log('Discord webhook received');
    return jsonResponse({ type: 1 }); // Pong response
  }),
});

// Email webhook
http.route({
  path: '/api/webhook/email',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    // TODO: Implement email inbound handler
    console.log('Email webhook received');
    return jsonResponse({ ok: true });
  }),
});

// ============================================
// Static File Hosting (Convex Self Static Hosting)
// ============================================
// Serves the React frontend from Convex Storage.
// API routes are prefixed with /api, static files served from root.
// See: https://github.com/get-convex/self-static-hosting
registerStaticRoutes(http, components.selfStaticHosting, {
  spaFallback: true, // Serve index.html for client-side routing
});

export default http;
