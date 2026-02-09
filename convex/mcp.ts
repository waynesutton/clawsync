'use node';

import { internalAction, ActionCtx } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import { checkSecurity } from './agent/security';

/**
 * MCP Internal Functions
 *
 * Internal functions for the MCP HTTP API endpoints.
 * Handles tool execution and resource listing.
 */

// Execute an MCP tool (skill)
export const executeTool = internalAction({
  args: {
    toolName: v.string(),
    input: v.optional(v.any()),
    apiKeyId: v.optional(v.id('apiKeys')),
  },
  returns: v.object({
    output: v.any(),
    error: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // Find the skill by name
    const skills: Array<{ name: string; description: string; skillType: string; config?: string; templateId?: string; _id: any }> = await ctx.runQuery(internal.skillRegistry.getActiveApproved);
    const skill = skills.find((s: { name: string }) => s.name === args.toolName);

    if (!skill) {
      return {
        error: `Tool not found: ${args.toolName}`,
        output: null,
      };
    }

    // Run security check (cast skill to expected Doc type)
    const securityResult = await checkSecurity(
      ctx as unknown as ActionCtx,
      skill as any,
      args.input
    );

    if (!securityResult.allowed) {
      // Log blocked invocation
      await ctx.runMutation(internal.skillInvocations.log, {
        skillName: skill.name,
        skillType: skill.skillType,
        input: JSON.stringify(args.input).slice(0, 1000),
        success: false,
        errorMessage: securityResult.reason,
        securityCheckResult: 'blocked',
        durationMs: Date.now() - startTime,
        timestamp: Date.now(),
      });

      return {
        error: `Security check failed: ${securityResult.reason}`,
        output: null,
      };
    }

    try {
      let output: unknown;

      // Execute based on skill type
      switch (skill.skillType) {
        case 'template':
          output = await executeTemplateSkill(ctx, skill, args.input);
          break;

        case 'webhook':
          output = await executeWebhookSkill(ctx, skill, args.input);
          break;

        case 'code':
          output = await executeCodeSkill(ctx, skill, args.input);
          break;

        default:
          throw new Error(`Unknown skill type: ${skill.skillType}`);
      }

      // Log successful invocation
      await ctx.runMutation(internal.skillInvocations.log, {
        skillName: skill.name,
        skillType: skill.skillType,
        input: JSON.stringify(args.input).slice(0, 1000),
        output: JSON.stringify(output).slice(0, 1000),
        success: true,
        securityCheckResult: 'passed',
        durationMs: Date.now() - startTime,
        channel: 'mcp_api',
        timestamp: Date.now(),
      });

      return {
        output,
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log failed invocation
      await ctx.runMutation(internal.skillInvocations.log, {
        skillName: skill.name,
        skillType: skill.skillType,
        input: JSON.stringify(args.input).slice(0, 1000),
        success: false,
        errorMessage,
        securityCheckResult: 'passed',
        durationMs: Date.now() - startTime,
        channel: 'mcp_api',
        timestamp: Date.now(),
      });

      return {
        error: errorMessage,
        output: null,
      };
    }
  },
});

// Execute a template-based skill
async function executeTemplateSkill(
  ctx: any,
  skill: any,
  input: unknown
): Promise<unknown> {
  // Get the template
  const template = await ctx.runQuery(internal.skillTemplates.getByTemplateId, {
    templateId: skill.templateId,
  });

  if (!template) {
    throw new Error(`Template not found: ${skill.templateId}`);
  }

  // Execute template
  return await ctx.runAction(internal.agent.skills.templates.execute.execute, {
    templateId: skill.templateId,
    config: skill.config ?? '{}',
    input: JSON.stringify(input),
  });
}

// Execute a webhook-based skill
async function executeWebhookSkill(
  ctx: any,
  skill: any,
  input: unknown
): Promise<unknown> {
  const config = skill.config ? JSON.parse(skill.config) : {};
  const webhookUrl = config.webhookUrl;

  if (!webhookUrl) {
    throw new Error('Webhook URL not configured');
  }

  // Get agent config for domain allowlist
  const agentConfig = await ctx.runQuery(internal.agentConfig.getConfig);
  const allowedDomains = agentConfig?.domainAllowlist ?? [];

  // Check if webhook domain is allowed
  const webhookHost = new URL(webhookUrl).hostname;
  if (allowedDomains.length > 0 && !allowedDomains.includes(webhookHost)) {
    throw new Error(`Domain not in allowlist: ${webhookHost}`);
  }

  // Make the webhook call
  const response = await fetch(webhookUrl, {
    method: config.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify(input),
    redirect: 'error', // SSRF prevention
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Execute a code-based skill
async function executeCodeSkill(
  _ctx: any,
  skill: any,
  _input: unknown
): Promise<unknown> {
  // Code skills are executed through the agent's tool system
  // They should be registered in the toolLoader
  throw new Error(`Code skill "${skill.name}" should be executed through the agent`);
}

// List available MCP resources
export const listResources = internalAction({
  args: {},
  returns: v.array(v.object({
    uri: v.string(),
    name: v.string(),
    description: v.string(),
    mimeType: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    // Get knowledge bases or other resources
    // For now, return empty list - can be extended to include:
    // - Knowledge base entries
    // - File storage references
    // - External data sources

    // Example structure:
    const resources: Array<{
      uri: string;
      name: string;
      description: string;
      mimeType?: string;
    }> = [];

    // Could query knowledge bases here
    // const knowledgeBases = await ctx.db.query('knowledgeBases').take(100);
    // resources.push(...knowledgeBases.map(kb => ({
    //   uri: `kb://${kb._id}`,
    //   name: kb.name,
    //   description: kb.description,
    //   mimeType: 'application/json',
    // })));

    return resources;
  },
});

// Read an MCP resource by URI
export const readResource = internalAction({
  args: {
    uri: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    // Parse URI and fetch resource
    const uri = args.uri;

    if (uri.startsWith('kb://')) {
      // Knowledge base resource
      const kbId = uri.replace('kb://', '');
      // const kb = await ctx.db.get(kbId as any);
      // return kb?.content;
      return { error: 'Knowledge base not implemented yet' };
    }

    return { error: `Unknown resource URI scheme: ${uri}` };
  },
});
