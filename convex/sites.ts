import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const upsertUser = mutation({
  args: { clerkUserId: v.string(), username: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { clerkUserId, username } = args;
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', clerkUserId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { username });
      return existing._id;
    }
    const userId = await ctx.db.insert('users', { clerkUserId, username, createdAt: now });
    // create a default site using the username or short id
    const slugBase = username ?? clerkUserId.slice(-6);
    await ctx.db.insert('sites', { ownerId: userId, name: `${slugBase}'s Site`, slug: slugBase, createdAt: now, updatedAt: now });
    return userId;
  },
});

export const getSiteBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const { slug } = args;
    return ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
  },
});

export const listSitesForClerk = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const { clerkUserId } = args;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', clerkUserId))
      .first();
    if (!user) return [];
    return ctx.db
      .query('sites')
      .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
      .collect();
  },
});
