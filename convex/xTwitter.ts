import { query, mutation, internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

/**
 * X/Twitter Integration
 *
 * Enables the agent to interact with X (Twitter) via API v2.
 * Features:
 * - Read tweets and mentions
 * - Reply to tweets
 * - Post new tweets
 * - Display agent tweets on landing page
 *
 * Required Environment Variables:
 * - X_BEARER_TOKEN: For read operations (OAuth 2.0 App-Only)
 * - X_API_KEY: OAuth 1.0a Consumer Key
 * - X_API_SECRET: OAuth 1.0a Consumer Secret
 * - X_ACCESS_TOKEN: OAuth 1.0a Access Token
 * - X_ACCESS_TOKEN_SECRET: OAuth 1.0a Access Token Secret
 *
 * See: https://developer.x.com/en/docs/x-api
 */

// ============================================
// Configuration
// ============================================

// Get X configuration
export const getConfig = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await ctx.db.query('xConfig').first() ?? null;
  },
});

// Update X configuration
export const updateConfig = mutation({
  args: {
    enabled: v.boolean(),
    username: v.optional(v.string()),
    showOnLanding: v.boolean(),
    autoReply: v.boolean(),
    postFromAgent: v.boolean(),
    rateLimitPerHour: v.number(),
  },
  returns: v.id('xConfig'),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('xConfig').first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert('xConfig', {
        ...args,
        updatedAt: Date.now(),
      });
    }
  },
});

// ============================================
// Tweet Queries
// ============================================

// Get tweets for landing page
export const getLandingTweets = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const config = await ctx.db.query('xConfig').first();

    // Only return tweets if showOnLanding is enabled
    if (!config?.showOnLanding) {
      return [];
    }

    return await ctx.db
      .query('xTweets')
      .withIndex('by_showOnLanding', (q) => q.eq('showOnLanding', true))
      .order('desc')
      .take(args.limit ?? 5);
  },
});

// Get all cached tweets (for SyncBoard)
export const listTweets = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('xTweets')
      .withIndex('by_postedAt')
      .order('desc')
      .take(args.limit ?? 50);
  },
});

// Toggle tweet visibility on landing page
export const toggleTweetLandingVisibility = mutation({
  args: {
    tweetId: v.string(),
    showOnLanding: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const tweet = await ctx.db
      .query('xTweets')
      .withIndex('by_tweetId', (q) => q.eq('tweetId', args.tweetId))
      .first();

    if (tweet) {
      await ctx.db.patch(tweet._id, { showOnLanding: args.showOnLanding });
    }
    return null;
  },
});

// ============================================
// Internal Functions
// ============================================

// Internal query for actions to read X config
export const getConfigInternal = internalQuery({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    return await ctx.db.query('xConfig').first() ?? null;
  },
});

export const cacheTweet = internalMutation({
  args: {
    tweetId: v.string(),
    text: v.string(),
    authorUsername: v.string(),
    authorDisplayName: v.optional(v.string()),
    authorProfileImageUrl: v.optional(v.string()),
    isAgentTweet: v.boolean(),
    isReply: v.boolean(),
    replyToTweetId: v.optional(v.string()),
    likeCount: v.optional(v.number()),
    retweetCount: v.optional(v.number()),
    replyCount: v.optional(v.number()),
    showOnLanding: v.boolean(),
    postedAt: v.optional(v.number()),
  },
  returns: v.id('xTweets'),
  handler: async (ctx, args) => {
    // Check if tweet already exists
    const existing = await ctx.db
      .query('xTweets')
      .withIndex('by_tweetId', (q) => q.eq('tweetId', args.tweetId))
      .first();

    if (existing) {
      // Update existing tweet
      await ctx.db.patch(existing._id, {
        ...args,
        fetchedAt: Date.now(),
      });
      return existing._id;
    }

    // Insert new tweet
    return await ctx.db.insert('xTweets', {
      ...args,
      postedAt: args.postedAt ?? Date.now(),
      fetchedAt: Date.now(),
    });
  },
});

export const logTweetActivity = internalMutation({
  args: {
    actionType: v.string(),
    summary: v.string(),
    visibility: v.union(v.literal('public'), v.literal('private')),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert('activityLog', {
      actionType: args.actionType,
      summary: args.summary,
      channel: 'x',
      visibility: args.visibility,
      timestamp: Date.now(),
    });
    return null;
  },
});

/**
 * NOTE: X/Twitter actions (postTweet, fetchMentions, readTweet) are in
 * xTwitterActions.ts which runs in Node.js runtime for process.env access.
 */
