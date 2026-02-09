import { query, mutation, internalQuery, internalMutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * MCP Server Management
 *
 * Manages connections to external MCP servers.
 * ClawSync can also act as an MCP server (see mcp/server.ts).
 */

// Get all MCP servers
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('mcpServers').order('desc').take(50);
  },
});

// Get enabled and approved servers (for tool loading)
export const getEnabledApproved = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('mcpServers')
      .filter((q) =>
        q.and(
          q.eq(q.field('enabled'), true),
          q.eq(q.field('approved'), true)
        )
      )
      .take(50);
  },
});

// Get server by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('mcpServers')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .first();
  },
});

// Get server by ID
export const getById = query({
  args: { id: v.id('mcpServers') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get server by ID (internal, for actions)
export const getByIdInternal = internalQuery({
  args: { id: v.id('mcpServers') },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id) ?? null;
  },
});

// Add a new MCP server
export const create = mutation({
  args: {
    name: v.string(),
    url: v.optional(v.string()),
    command: v.optional(v.string()),
    args: v.optional(v.array(v.string())),
    apiKeyEnvVar: v.optional(v.string()),
    rateLimitPerMinute: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('mcpServers', {
      name: args.name,
      url: args.url,
      command: args.command,
      args: args.args,
      apiKeyEnvVar: args.apiKeyEnvVar,
      enabled: false, // Start disabled
      rateLimitPerMinute: args.rateLimitPerMinute ?? 50,
      approved: false, // Requires owner approval
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an MCP server
export const update = mutation({
  args: {
    id: v.id('mcpServers'),
    name: v.optional(v.string()),
    url: v.optional(v.string()),
    command: v.optional(v.string()),
    args: v.optional(v.array(v.string())),
    apiKeyEnvVar: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    rateLimitPerMinute: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Approve an MCP server
export const approve = mutation({
  args: { id: v.id('mcpServers') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      approved: true,
      updatedAt: Date.now(),
    });
  },
});

// Reject/disable an MCP server
export const reject = mutation({
  args: { id: v.id('mcpServers') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      approved: false,
      enabled: false,
      updatedAt: Date.now(),
    });
  },
});

// Delete an MCP server
export const remove = mutation({
  args: { id: v.id('mcpServers') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Update health status (called by cron)
export const updateHealth = internalMutation({
  args: {
    id: v.id('mcpServers'),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      healthStatus: args.status,
      lastHealthCheck: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Health check (called by cron)
export const healthCheck = internalMutation({
  args: {},
  handler: async (ctx) => {
    const servers = await ctx.db
      .query('mcpServers')
      .filter((q) => q.eq(q.field('enabled'), true))
      .take(50);

    // In a real implementation, this would ping each server
    // For now, just mark as healthy
    for (const server of servers) {
      await ctx.db.patch(server._id, {
        healthStatus: 'healthy',
        lastHealthCheck: Date.now(),
      });
    }

    return { checked: servers.length };
  },
});
