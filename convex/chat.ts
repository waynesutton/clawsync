'use node';

import { action, internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { clawsyncAgent, createDynamicAgent } from './agent/clawsync';
import { rateLimiter } from './rateLimits';
import { loadTools } from './agent/toolLoader';

/**
 * Chat Functions
 *
 * Handles sending messages to the agent and receiving responses.
 * Uses @convex-dev/agent for thread management and streaming.
 * Model and tools are resolved dynamically from SyncBoard config.
 */

// Send a message and get a response
export const send = action({
  args: {
    threadId: v.optional(v.string()),
    message: v.string(),
    sessionId: v.string(),
  },
  returns: v.object({
    response: v.optional(v.string()),
    error: v.optional(v.string()),
    threadId: v.optional(v.string()),
    toolCalls: v.optional(
      v.array(v.object({ name: v.string(), args: v.string(), result: v.string() }))
    ),
  }),
  handler: async (ctx, args) => {
    // Rate limit check
    const { ok } = await rateLimiter.limit(ctx, 'publicChat', {
      key: args.sessionId,
    });

    if (!ok) {
      return {
        error: 'Rate limit exceeded. Please wait before sending another message.',
        threadId: args.threadId,
      };
    }

    // Global rate limit
    const { ok: globalOk } = await rateLimiter.limit(ctx, 'globalMessages', {
      key: 'global',
    });

    if (!globalOk) {
      return {
        error: 'The agent is currently busy. Please try again in a moment.',
        threadId: args.threadId,
      };
    }

    // Validate message length
    const maxLength = 4000;
    if (args.message.length > maxLength) {
      return {
        error: `Message too long. Maximum ${maxLength} characters.`,
        threadId: args.threadId,
      };
    }

    try {
      // Use dynamic agent for SyncBoard-configured model + tools
      const agent = await createDynamicAgent(ctx);

      // Create or continue thread (destructure per @convex-dev/agent API)
      let threadId = args.threadId;
      let thread;
      if (threadId) {
        ({ thread } = await agent.continueThread(ctx, { threadId }));
      } else {
        const created = await agent.createThread(ctx, {});
        threadId = created.threadId;
        thread = created.thread;
      }

      // Load soul document from config for system prompt
      // Break circular type with explicit annotation
      const config: {
        soulDocument?: string;
        systemPrompt?: string;
      } | null = await ctx.runQuery(internal.agentConfig.getConfig as any);
      const system: string | undefined = config
        ? `${config.soulDocument}\n\n${config.systemPrompt}`
        : undefined;

      // Load tools from skill registry + MCP servers
      const tools = await loadTools(ctx);

      // Generate response with tools and multi-step support
      const hasTools = Object.keys(tools).length > 0;
      const result: { text: string; steps?: Array<unknown> } = await thread.generateText(
        {
          prompt: args.message,
          ...(system && { system }),
          ...(hasTools && { tools }),
          ...(hasTools && { maxSteps: 5 }),
        },
        {
          // Save all messages (including tool call steps) so the
          // frontend subscription picks them up incrementally.
          storageOptions: { saveMessages: 'all' },
        },
      );

      // Log activity
      await ctx.runMutation(internal.activityLog.log, {
        actionType: 'chat_message',
        summary: `Responded to: "${args.message.slice(0, 50)}${args.message.length > 50 ? '...' : ''}"`,
        visibility: 'private',
      });

      // Extract tool call info from steps
      const toolCalls: Array<{ name: string; args: string; result: string }> = [];
      const steps = (result as any).steps;
      if (Array.isArray(steps)) {
        for (const step of steps) {
          if (Array.isArray(step.toolCalls)) {
            for (const tc of step.toolCalls) {
              const toolResult = step.toolResults?.find(
                (tr: any) => tr.toolCallId === tc.toolCallId
              )?.result;
              toolCalls.push({
                name: tc.toolName ?? tc.name ?? 'unknown',
                args: JSON.stringify(tc.args ?? {}, null, 2),
                result: toolResult
                  ? typeof toolResult === 'string'
                    ? toolResult.slice(0, 1000)
                    : JSON.stringify(toolResult, null, 2).slice(0, 1000)
                  : '',
              });
            }
          }
        }
      }

      return {
        response: result.text,
        threadId,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };
    } catch (error) {
      console.error('Chat error:', error);
      return {
        error: 'Failed to generate response. Please try again.',
        threadId: args.threadId,
      };
    }
  },
});

// Stream a response (for real-time output)
export const stream = internalAction({
  args: {
    threadId: v.optional(v.string()),
    message: v.string(),
    sessionId: v.string(),
  },
  returns: v.object({
    response: v.string(),
    threadId: v.string(),
  }),
  handler: async (ctx, args) => {
    // Rate limit check
    const { ok } = await rateLimiter.limit(ctx, 'publicChat', {
      key: args.sessionId,
    });

    if (!ok) {
      throw new Error('Rate limit exceeded');
    }

    // Use dynamic agent for SyncBoard-configured model + tools
    const agent = await createDynamicAgent(ctx);

    let threadId = args.threadId;
    let thread;
    if (threadId) {
      ({ thread } = await agent.continueThread(ctx, { threadId }));
    } else {
      const created = await agent.createThread(ctx, {});
      threadId = created.threadId;
      thread = created.thread;
    }

    // Use streaming generation
    const result = await thread.generateText({
      prompt: args.message,
    });

    return {
      response: result.text,
      threadId,
    };
  },
});

// Get thread history
export const getHistory = action({
  args: {
    threadId: v.string(),
  },
  returns: v.object({
    messages: v.any(),
  }),
  handler: async (ctx, args) => {
    try {
      // Use static agent for read-only history lookup
      const result = await clawsyncAgent.listMessages(ctx, {
        threadId: args.threadId,
        paginationOpts: { numItems: 100, cursor: null },
      });

      return { messages: result.page };
    } catch {
      return { messages: [] };
    }
  },
});

// API Send - Internal action for HTTP API
export const apiSend = internalAction({
  args: {
    message: v.string(),
    threadId: v.optional(v.string()),
    sessionId: v.string(),
    apiKeyId: v.optional(v.id('apiKeys')),
  },
  returns: v.object({
    response: v.optional(v.string()),
    error: v.optional(v.string()),
    threadId: v.optional(v.string()),
    tokensUsed: v.optional(v.number()),
    inputTokens: v.optional(v.number()),
    outputTokens: v.optional(v.number()),
  }),
  handler: async (ctx, args) => {
    // Validate message length
    const maxLength = 4000;
    if (args.message.length > maxLength) {
      return {
        error: `Message too long. Maximum ${maxLength} characters.`,
        threadId: args.threadId,
      };
    }

    try {
      // Use dynamic agent for SyncBoard-configured model + tools
      const agent = await createDynamicAgent(ctx);

      // Create or continue thread
      let threadId = args.threadId;
      let thread;
      if (threadId) {
        ({ thread } = await agent.continueThread(ctx, { threadId }));
      } else {
        const created = await agent.createThread(ctx, {});
        threadId = created.threadId;
        thread = created.thread;
      }

      // Generate response
      const result = await thread.generateText({
        prompt: args.message,
      });

      // Log activity
      await ctx.runMutation(internal.activityLog.log, {
        actionType: 'api_chat',
        summary: `API: "${args.message.slice(0, 50)}${args.message.length > 50 ? '...' : ''}"`,
        visibility: 'private',
        channel: 'api',
      });

      // Get token usage from result if available
      const usage = (result as unknown as Record<string, unknown>).usage as
        | { promptTokens?: number; completionTokens?: number }
        | undefined;

      return {
        response: result.text,
        threadId,
        tokensUsed: (usage?.promptTokens ?? 0) + (usage?.completionTokens ?? 0),
        inputTokens: usage?.promptTokens ?? 0,
        outputTokens: usage?.completionTokens ?? 0,
      };
    } catch (error) {
      console.error('API Chat error:', error);
      return {
        error: 'Failed to generate response. Please try again.',
        threadId: args.threadId,
      };
    }
  },
});
