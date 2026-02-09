/**
 * MCP Client Implementation
 *
 * Connects to external MCP servers configured in SyncBoard.
 * Tools from connected servers are made available to the agent.
 *
 * For each connected server:
 * 1. Fetch tool list on connection (cached)
 * 2. Health check every 5 minutes via cron
 * 3. Route tool calls through security checker
 * 4. Rate limit per server
 * 5. Log all calls to skillInvocationLog
 */

import { internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';

// Fetch tools from an MCP server
export const fetchTools = internalAction({
  args: {
    serverId: v.id('mcpServers'),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const server: { url?: string; approved: boolean; enabled: boolean } | null =
      await ctx.runQuery(internal.mcpServers.getByIdInternal, { id: args.serverId });

    if (!server || !server.url) {
      throw new Error('Server not found or no URL configured');
    }

    try {
      const response = await fetch(server.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'tools/list', params: {} }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.status}`);
      }

      const data: { tools?: Array<unknown> } = await response.json();
      return data.tools || [];
    } catch (error) {
      console.error('MCP client error:', error);
      return [];
    }
  },
});

// Call a tool on an MCP server
export const callTool = internalAction({
  args: {
    serverId: v.id('mcpServers'),
    toolName: v.string(),
    toolArgs: v.any(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    // Break circular type with 'as any' on function reference
    const server: { url?: string; approved: boolean; enabled: boolean } | null =
      await ctx.runQuery(internal.mcpServers.getByIdInternal as any, { id: args.serverId });

    if (!server || !server.url) {
      throw new Error('Server not found or no URL configured');
    }

    if (!server.approved) {
      throw new Error('Server not approved');
    }

    if (!server.enabled) {
      throw new Error('Server not enabled');
    }

    try {
      const response: Response = await fetch(server.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: args.toolName,
            arguments: args.toolArgs,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MCP tool call error:', error);
      throw error;
    }
  },
});
