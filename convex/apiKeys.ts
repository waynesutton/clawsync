import { query, mutation, internalQuery, internalMutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * API Keys Management
 *
 * Manages API keys for external access to ClawSync.
 * Keys are hashed using SHA-256 before storage.
 *
 * Key types:
 * - agent: Access to chat/agent API
 * - data: Read access to skills, activity, etc.
 * - admin: Full management access
 */

// Available scopes for API keys
export const API_SCOPES = {
  agent: [
    'agent:chat', // Send messages to agent
    'agent:threads:read', // Read thread history
    'agent:threads:create', // Create new threads
  ],
  data: [
    'data:skills:read', // Read skill list
    'data:activity:read', // Read activity log
    'data:config:read', // Read agent config
    'data:usage:read', // Read API usage stats
  ],
  mcp: [
    'mcp:tools:list', // List available MCP tools
    'mcp:tools:call', // Call MCP tools
    'mcp:resources:read', // Read MCP resources
    'mcp:*', // Full MCP access
  ],
  admin: [
    'admin:keys:manage', // Manage API keys
    'admin:skills:manage', // Manage skills
    'admin:config:manage', // Manage configuration
    'admin:mcp:manage', // Manage MCP servers
  ],
} as const;

// All available scopes flattened
export const ALL_SCOPES = [
  ...API_SCOPES.agent,
  ...API_SCOPES.data,
  ...API_SCOPES.mcp,
  ...API_SCOPES.admin,
];

// Generate a cryptographically secure API key
function generateApiKey(type: 'agent' | 'data' | 'admin'): string {
  const prefix = type === 'admin' ? 'cs_admin_' : type === 'agent' ? 'cs_agent_' : 'cs_data_';
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const randomPart = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${prefix}${randomPart}`;
}

// Hash an API key using SHA-256
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Get all API keys (masked)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const keys = await ctx.db
      .query('apiKeys')
      .order('desc')
      .take(100);

    // Return masked keys
    return keys.map((key) => ({
      _id: key._id,
      name: key.name,
      description: key.description,
      keyPrefix: key.keyPrefix,
      keyType: key.keyType,
      scopes: key.scopes,
      rateLimitPerMinute: key.rateLimitPerMinute,
      rateLimitPerDay: key.rateLimitPerDay,
      allowedOrigins: key.allowedOrigins,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
      isActive: key.isActive,
      createdAt: key.createdAt,
    }));
  },
});

// Get API key by ID
export const get = query({
  args: { id: v.id('apiKeys') },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.id);
    if (!key) return null;

    // Return masked key
    return {
      _id: key._id,
      name: key.name,
      description: key.description,
      keyPrefix: key.keyPrefix,
      keyType: key.keyType,
      scopes: key.scopes,
      rateLimitPerMinute: key.rateLimitPerMinute,
      rateLimitPerDay: key.rateLimitPerDay,
      allowedOrigins: key.allowedOrigins,
      allowedIps: key.allowedIps,
      expiresAt: key.expiresAt,
      lastUsedAt: key.lastUsedAt,
      usageCount: key.usageCount,
      isActive: key.isActive,
      createdAt: key.createdAt,
    };
  },
});

// Validate API key (internal - returns full key data if valid)
export const validateKey = internalQuery({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    const key = await ctx.db
      .query('apiKeys')
      .withIndex('by_keyHash', (q) => q.eq('keyHash', args.keyHash))
      .first();

    if (!key) return null;
    if (!key.isActive) return null;
    if (key.expiresAt && key.expiresAt < Date.now()) return null;

    return key;
  },
});

// Create a new API key
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    keyType: v.union(
      v.literal('agent'),
      v.literal('data'),
      v.literal('admin')
    ),
    scopes: v.optional(v.array(v.string())),
    rateLimitPerMinute: v.optional(v.number()),
    rateLimitPerDay: v.optional(v.number()),
    allowedOrigins: v.optional(v.array(v.string())),
    allowedIps: v.optional(v.array(v.string())),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Generate the API key
    const plainKey = generateApiKey(args.keyType);
    const keyHash = await hashApiKey(plainKey);
    const keyPrefix = plainKey.slice(0, 16); // e.g., "cs_agent_abc123"

    // Default scopes based on key type (spread to create mutable arrays)
    const defaultScopes: Array<string> = args.keyType === 'admin'
      ? [...API_SCOPES.admin, ...API_SCOPES.agent, ...API_SCOPES.data]
      : args.keyType === 'agent'
        ? [...API_SCOPES.agent]
        : [...API_SCOPES.data];

    const now = Date.now();
    const keyId = await ctx.db.insert('apiKeys', {
      name: args.name,
      description: args.description,
      keyHash,
      keyPrefix,
      keyType: args.keyType,
      scopes: args.scopes ?? defaultScopes,
      rateLimitPerMinute: args.rateLimitPerMinute ?? 60,
      rateLimitPerDay: args.rateLimitPerDay,
      allowedOrigins: args.allowedOrigins,
      allowedIps: args.allowedIps,
      expiresAt: args.expiresAt,
      lastUsedAt: undefined,
      usageCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Return the plain key ONLY on creation (never stored or returned again)
    return {
      id: keyId,
      key: plainKey,
      keyPrefix,
    };
  },
});

// Update API key settings
export const update = mutation({
  args: {
    id: v.id('apiKeys'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    scopes: v.optional(v.array(v.string())),
    rateLimitPerMinute: v.optional(v.number()),
    rateLimitPerDay: v.optional(v.number()),
    allowedOrigins: v.optional(v.array(v.string())),
    allowedIps: v.optional(v.array(v.string())),
    expiresAt: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Revoke an API key
export const revoke = mutation({
  args: { id: v.id('apiKeys') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});

// Delete an API key
export const remove = mutation({
  args: { id: v.id('apiKeys') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Record API key usage (internal)
export const recordUsage = internalMutation({
  args: { id: v.id('apiKeys') },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.id);
    if (!key) return;

    await ctx.db.patch(args.id, {
      lastUsedAt: Date.now(),
      usageCount: key.usageCount + 1,
    });
  },
});

// Regenerate an API key (creates new key, keeps settings)
export const regenerate = mutation({
  args: { id: v.id('apiKeys') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error('API key not found');

    // Generate new key
    const plainKey = generateApiKey(existing.keyType);
    const keyHash = await hashApiKey(plainKey);
    const keyPrefix = plainKey.slice(0, 16);

    await ctx.db.patch(args.id, {
      keyHash,
      keyPrefix,
      usageCount: 0,
      lastUsedAt: undefined,
      updatedAt: Date.now(),
    });

    return {
      id: args.id,
      key: plainKey,
      keyPrefix,
    };
  },
});
