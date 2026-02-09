/**
 * MCP Server Implementation
 *
 * Exposes ClawSync's active skills as MCP tools.
 * Any MCP client (Claude Desktop, Cursor, VS Code) can connect.
 *
 * Implements:
 * - tools/list: Returns all approved + active skills
 * - tools/call: Routes to skill executor (through security checker)
 * - resources/list: Returns available knowledge bases
 * - resources/read: Returns knowledge base content
 */

import { httpAction } from '../_generated/server';
import { internal } from '../_generated/api';

// MCP server handler
export const handler = httpAction(async (ctx, request) => {
  const body: { method: string; params?: Record<string, unknown> } = await request.json();
  const { method, params } = body;

  switch (method) {
    case 'tools/list': {
      // Get all active + approved skills
      const skills: Array<{
        name: string;
        description: string;
        config?: string;
      }> = await ctx.runQuery(internal.skillRegistry.getActiveApproved);

      const tools = skills.map((skill) => ({
        name: skill.name,
        description: skill.description,
        inputSchema: skill.config ? JSON.parse(skill.config).inputSchema : {},
      }));

      return new Response(
        JSON.stringify({ tools }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    case 'tools/call': {
      // TODO: Implement tool call routing
      // 1. Find skill by name
      // 2. Run through security checker
      // 3. Execute skill
      // 4. Return result
      return new Response(
        JSON.stringify({ error: 'Not implemented' }),
        { status: 501, headers: { 'Content-Type': 'application/json' } }
      );
    }

    case 'resources/list': {
      // TODO: Return knowledge base resources
      return new Response(
        JSON.stringify({ resources: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    case 'resources/read': {
      // TODO: Return knowledge base content
      return new Response(
        JSON.stringify({ error: 'Not implemented' }),
        { status: 501, headers: { 'Content-Type': 'application/json' } }
      );
    }

    default:
      return new Response(
        JSON.stringify({ error: `Unknown method: ${method}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
  }
});
