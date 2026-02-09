'use node';

import { action } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';

/**
 * X/Twitter Actions (Node.js runtime)
 *
 * Actions that require process.env for X API credentials.
 * Queries and mutations live in xTwitter.ts (V8 runtime).
 */

// Post a tweet
export const postTweet = action({
  args: {
    text: v.string(),
    replyToTweetId: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    // Check if X integration is enabled and posting is allowed
    const config = await ctx.runQuery(internal.xTwitter.getConfigInternal);
    if (!config?.enabled || !config?.postFromAgent) {
      throw new Error('X/Twitter posting is not enabled');
    }

    // Get credentials from environment
    const apiKey = process.env.X_API_KEY;
    const apiSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

    if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
      throw new Error('X/Twitter credentials not configured. Set X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET in Convex environment.');
    }

    // Build request body
    const body: Record<string, unknown> = { text: args.text };
    if (args.replyToTweetId) {
      body.reply = { in_reply_to_tweet_id: args.replyToTweetId };
    }

    // Make OAuth 1.0a signed request to X API v2
    const response = await makeOAuthRequest(
      'POST',
      'https://api.twitter.com/2/tweets',
      body,
      { apiKey, apiSecret, accessToken, accessTokenSecret }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to post tweet: ${error}`);
    }

    const result = await response.json();

    // Cache the tweet
    await ctx.runMutation(internal.xTwitter.cacheTweet, {
      tweetId: result.data.id,
      text: args.text,
      authorUsername: config.username || 'agent',
      isAgentTweet: true,
      isReply: !!args.replyToTweetId,
      replyToTweetId: args.replyToTweetId,
      showOnLanding: config.showOnLanding,
    });

    // Log activity
    await ctx.runMutation(internal.xTwitter.logTweetActivity, {
      actionType: args.replyToTweetId ? 'x_reply' : 'x_post',
      summary: args.replyToTweetId
        ? `Replied to tweet: ${args.text.substring(0, 50)}...`
        : `Posted tweet: ${args.text.substring(0, 50)}...`,
      visibility: 'public' as const,
    });

    return result.data;
  },
});

// Read mentions (for auto-reply feature)
export const fetchMentions = action({
  args: {
    sinceId: v.optional(v.string()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
      throw new Error('X_BEARER_TOKEN not configured');
    }

    const config = await ctx.runQuery(internal.xTwitter.getConfigInternal);
    if (!config?.enabled || !config?.username) {
      throw new Error('X/Twitter integration not configured');
    }

    // Get user ID from username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${config.username}`,
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );

    if (!userResponse.ok) {
      throw new Error('Failed to get user info');
    }

    const userData = await userResponse.json();
    const userId: string = userData.data.id;

    // Fetch mentions
    let url: string = `https://api.twitter.com/2/users/${userId}/mentions?tweet.fields=author_id,created_at,public_metrics&expansions=author_id&user.fields=username,name,profile_image_url`;
    if (args.sinceId) {
      url += `&since_id=${args.sinceId}`;
    }

    const response: Response = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mentions');
    }

    return await response.json();
  },
});

// Read a specific tweet
export const readTweet = action({
  args: {
    tweetId: v.string(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const bearerToken = process.env.X_BEARER_TOKEN;
    if (!bearerToken) {
      throw new Error('X_BEARER_TOKEN not configured');
    }

    const response = await fetch(
      `https://api.twitter.com/2/tweets/${args.tweetId}?tweet.fields=author_id,created_at,public_metrics,conversation_id&expansions=author_id&user.fields=username,name,profile_image_url`,
      {
        headers: { Authorization: `Bearer ${bearerToken}` },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to read tweet');
    }

    return await response.json();
  },
});

// ============================================
// OAuth 1.0a Helper (simplified)
// ============================================

async function makeOAuthRequest(
  method: string,
  url: string,
  body: Record<string, unknown>,
  credentials: {
    apiKey: string;
    apiSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  }
): Promise<Response> {
  // In production, use a proper OAuth 1.0a library like oauth-1.0a
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = Math.random().toString(36).substring(2);

  const oauthParams = {
    oauth_consumer_key: credentials.apiKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: credentials.accessToken,
    oauth_version: '1.0',
  };

  // Generate signature (simplified - use oauth-1.0a library in production)
  const signature = 'PLACEHOLDER_SIGNATURE';

  const authHeader = `OAuth oauth_consumer_key="${oauthParams.oauth_consumer_key}", oauth_nonce="${oauthParams.oauth_nonce}", oauth_signature="${encodeURIComponent(signature)}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${oauthParams.oauth_timestamp}", oauth_token="${oauthParams.oauth_token}", oauth_version="1.0"`;

  return fetch(url, {
    method,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
