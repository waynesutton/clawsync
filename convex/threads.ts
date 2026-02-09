import { query, internalQuery, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { components } from './_generated/api';
import { listMessages } from '@convex-dev/agent';
import { paginationOptsValidator } from 'convex/server';

/**
 * Thread Management
 *
 * Manages conversation threads using @convex-dev/agent component API.
 * Thread and message data lives in component tables accessed via
 * listMessages() and components.agent queries.
 */

// List threads by user (internal, for API)
export const list = internalQuery({
  args: {
    userId: v.optional(v.string()),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    try {
      if (args.userId) {
        // Use component API to list threads by user
        const result = await ctx.runQuery(
          components.agent.threads.listThreadsByUserId,
          {
            userId: args.userId,
            paginationOpts: args.paginationOpts ?? { cursor: null, numItems: 20 },
          },
        );
        return result.page.map((t: Record<string, unknown>) => ({
          threadId: t._id,
          createdAt: t._creationTime,
          metadata: t.metadata,
        }));
      }
      // Without userId, return empty (component requires userId for listing)
      return [];
    } catch {
      return [];
    }
  },
});

// Get messages for a thread (internal, for API)
export const getMessages = internalQuery({
  args: {
    threadId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    try {
      const result = await listMessages(ctx, components.agent, {
        threadId: args.threadId,
        paginationOpts: { cursor: null, numItems: args.limit ?? 100 },
        excludeToolMessages: true,
      });

      return result.page.map((m: Record<string, unknown>) => ({
        id: m._id,
        role: m.role,
        content: m.text ?? m.content,
        createdAt: m._creationTime,
      }));
    } catch {
      return [];
    }
  },
});

// Public query to list thread messages (for SyncBoard)
export const listPublic = query({
  args: {
    userId: v.optional(v.string()),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    try {
      if (args.userId) {
        const result = await ctx.runQuery(
          components.agent.threads.listThreadsByUserId,
          {
            userId: args.userId,
            paginationOpts: args.paginationOpts ?? { cursor: null, numItems: 20 },
          },
        );
        return result.page.map((t: Record<string, unknown>) => ({
          threadId: t._id,
          createdAt: t._creationTime,
          metadata: t.metadata,
        }));
      }
      // Without userId filter, return empty
      // (admin thread listing needs component-level access)
      return [];
    } catch {
      // Component tables may not be populated yet
      return [];
    }
  },
});

// Get thread messages (public, for SyncBoard)
export const getThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    try {
      const result = await listMessages(ctx, components.agent, {
        threadId: args.threadId,
        paginationOpts: args.paginationOpts ?? { cursor: null, numItems: 100 },
        excludeToolMessages: true,
      });

      return result.page.map((m: Record<string, unknown>) => ({
        id: m._id,
        role: m.role,
        content: m.text ?? m.content,
        createdAt: m._creationTime,
      }));
    } catch {
      return [];
    }
  },
});

// Create a new thread (internal, for HTTP API)
export const create = internalMutation({
  args: {
    title: v.optional(v.string()),
  },
  returns: v.object({
    threadId: v.string(),
  }),
  handler: async (ctx, args) => {
    // Create thread via the agent component
    const thread = await ctx.runMutation(
      components.agent.threads.createThread,
      {
        userId: 'api',
        ...(args.title ? { title: args.title } : {}),
      },
    );
    return { threadId: thread._id };
  },
});
