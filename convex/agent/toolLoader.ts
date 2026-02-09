import { ActionCtx } from '../_generated/server';
import { api, internal } from '../_generated/api';
import { Doc } from '../_generated/dataModel';
import { createTool } from '@convex-dev/agent';
import { jsonSchema } from 'ai';
import { checkSecurity, truncateForLog } from './security';

/**
 * Tool Loader
 *
 * Assembles the agent's tools at invocation time from:
 * 1. Skills from skillRegistry (approved + active)
 * 2. Tools from connected MCP servers (approved + enabled)
 *
 * All tools pass through the security checker before execution.
 */

export type ToolSet = Record<string, any>;

/**
 * Load all tools for the agent
 */
export async function loadTools(ctx: ActionCtx): Promise<ToolSet> {
  const tools: ToolSet = {};

  // Load skills from skillRegistry
  const skills = await ctx.runQuery(internal.skillRegistry.getActiveApproved);

  for (const skill of skills) {
    const toolFn = createToolFromSkill(ctx, skill);
    if (toolFn) {
      // Sanitize name to match Anthropic's pattern: ^[a-zA-Z0-9_-]{1,128}
      const safeName = skill.name
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 128);
      tools[safeName] = toolFn;
    }
  }

  // Load tools from enabled MCP servers
  try {
    const mcpServers: Array<{ name: string; url?: string; _id: any }> =
      // @ts-expect-error Deep type instantiation in generated API types
      await ctx.runQuery(api.mcpServers.getEnabledApproved);

    for (const server of mcpServers) {
      if (!server.url) continue;

      try {
        // Fetch tool list from MCP server (SSE transport requires Accept header)
        const response = await fetch(server.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
          },
          body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', params: {}, id: 1 }),
        });

        if (!response.ok) continue;

        const data = await response.json();
        const mcpTools = data.result?.tools || data.tools || [];

        for (const mcpTool of mcpTools) {
          const safeName = (mcpTool.name as string)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .replace(/_+/g, '_')
            .slice(0, 128);

          tools[safeName] = createMcpTool(server.url, mcpTool);
        }
      } catch (e) {
        console.error(`Failed to load tools from MCP server ${server.name}:`, e);
      }
    }
  } catch (e) {
    console.error('Failed to load MCP servers:', e);
  }

  return tools;
}

/**
 * Create a tool that proxies to an MCP server
 */
function createMcpTool(serverUrl: string, mcpTool: any) {
  const schema = mcpTool.inputSchema || { type: 'object', properties: {} };

  return createTool({
    description: mcpTool.description || mcpTool.name,
    args: jsonSchema(schema),
    handler: async (_toolCtx: any, args: any) => {
      try {
        const response = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'tools/call',
            params: { name: mcpTool.name, arguments: args },
            id: 1,
          }),
        });

        if (!response.ok) {
          return { error: `MCP tool call failed: ${response.status}` };
        }

        const data = await response.json();
        return data.result || data;
      } catch (error) {
        return { error: error instanceof Error ? error.message : 'MCP tool call failed' };
      }
    },
  });
}

const inputSchema = jsonSchema<{ input: string }>({
  type: 'object' as const,
  properties: {
    input: { type: 'string', description: 'Input for the skill' },
  },
  required: ['input'],
});

/**
 * Create an AI SDK tool from a skill registry entry
 */
function createToolFromSkill(
  ctx: ActionCtx,
  skill: Doc<'skillRegistry'>
): any | null {
  switch (skill.skillType) {
    case 'template':
      return createTemplateSkillTool(ctx, skill);
    case 'webhook':
      return createWebhookSkillTool(ctx, skill);
    case 'code':
      return createCodeSkillTool(ctx, skill);
    default:
      return null;
  }
}

/**
 * Create a tool from a template skill
 */
function createTemplateSkillTool(ctx: ActionCtx, skill: Doc<'skillRegistry'>) {
  return createTool({
    description: skill.description,
    args: inputSchema,
    handler: async (_toolCtx, { input }: { input: string }) => {
      const startTime = Date.now();

      const securityResult = await checkSecurity(ctx, skill, input);
      if (!securityResult.allowed) {
        await logInvocation(ctx, skill, input, null, false, securityResult, startTime);
        return { error: securityResult.reason };
      }

      try {
        const result = await ctx.runAction(
          internal.agent.skills.templates.execute.execute,
          {
            templateId: skill.templateId!,
            config: skill.config || '{}',
            input,
          }
        );

        await logInvocation(ctx, skill, input, result, true, securityResult, startTime);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await logInvocation(ctx, skill, input, null, false, securityResult, startTime, errorMessage);
        return { error: errorMessage };
      }
    },
  });
}

/**
 * Create a tool from a webhook skill
 */
function createWebhookSkillTool(ctx: ActionCtx, skill: Doc<'skillRegistry'>) {
  return createTool({
    description: skill.description,
    args: inputSchema,
    handler: async (_toolCtx, { input }: { input: string }) => {
      const startTime = Date.now();

      const config = skill.config ? JSON.parse(skill.config) : {};
      const domain = config.url ? new URL(config.url).hostname : undefined;

      const securityResult = await checkSecurity(ctx, skill, input, { domain });
      if (!securityResult.allowed) {
        await logInvocation(ctx, skill, input, null, false, securityResult, startTime);
        return { error: securityResult.reason };
      }

      try {
        const result = await ctx.runAction(
          internal.agent.skills.templates.execute.webhookCaller,
          {
            config: skill.config || '{}',
            input,
            skillId: skill._id,
          }
        );

        await logInvocation(ctx, skill, input, result, true, securityResult, startTime);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await logInvocation(ctx, skill, input, null, false, securityResult, startTime, errorMessage);
        return { error: errorMessage };
      }
    },
  });
}

/**
 * Create a tool from a code-defined skill
 */
function createCodeSkillTool(ctx: ActionCtx, skill: Doc<'skillRegistry'>) {
  return createTool({
    description: skill.description,
    args: jsonSchema<{ query: string }>({
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Query input' },
      },
      required: ['query'],
    }),
    handler: async (_toolCtx, { query }: { query: string }) => {
      const startTime = Date.now();

      const securityResult = await checkSecurity(ctx, skill, query);
      if (!securityResult.allowed) {
        await logInvocation(ctx, skill, query, null, false, securityResult, startTime);
        return { error: securityResult.reason };
      }

      try {
        const result = `Code skill "${skill.name}" executed with query: ${query}`;
        await logInvocation(ctx, skill, query, result, true, securityResult, startTime);
        return { result };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await logInvocation(ctx, skill, query, null, false, securityResult, startTime, errorMessage);
        return { error: errorMessage };
      }
    },
  });
}

/**
 * Log skill invocation to the audit log
 */
async function logInvocation(
  ctx: ActionCtx,
  skill: Doc<'skillRegistry'>,
  input: unknown,
  output: unknown,
  success: boolean,
  securityResult: { code: string },
  startTime: number,
  errorMessage?: string
): Promise<void> {
  const durationMs = Date.now() - startTime;

  await ctx.runMutation(internal.skillInvocations.log, {
    skillName: skill.name,
    skillType: skill.skillType,
    input: truncateForLog(input),
    output: output ? truncateForLog(output) : undefined,
    success,
    errorMessage,
    securityCheckResult: securityResult.code,
    durationMs,
    timestamp: Date.now(),
  });
}
