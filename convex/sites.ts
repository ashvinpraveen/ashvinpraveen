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

export const getSettings = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (!site) return null;
    const {
      seoTitle,
      seoDescription,
      ogImageId,
      themeMode,
      primaryColor,
      backgroundColor,
      backgroundImageId,
      fontBody,
      fontHeading,
      customDomain,
      name,
      title,
      bio,
      slug,
    } = site as any;
    return {
      name,
      title,
      bio,
      slug,
      seoTitle,
      seoDescription,
      ogImageId,
      themeMode,
      primaryColor,
      backgroundColor,
      backgroundImageId,
      fontBody,
      fontHeading,
      customDomain,
    };
  },
});

export const updateSettings = mutation({
  args: {
    slug: v.string(),
    // Basics
    name: v.optional(v.string()),
    title: v.optional(v.string()),
    bio: v.optional(v.string()),
    // SEO
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    ogImageId: v.optional(v.id('images')),
    // Appearance
    themeMode: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    backgroundColor: v.optional(v.string()),
    backgroundImageId: v.optional(v.id('images')),
    fontBody: v.optional(v.string()),
    fontHeading: v.optional(v.string()),
    // Domain
    customDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (!site) throw new Error('Site not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized');

    const patch: any = { updatedAt: Date.now() };
    for (const key of [
      'name','title','bio',
      'seoTitle','seoDescription','ogImageId',
      'themeMode','primaryColor','backgroundColor','backgroundImageId','fontBody','fontHeading',
      'customDomain',
    ]) {
      const v = (args as any)[key];
      if (v !== undefined) patch[key] = v;
    }

    await ctx.db.patch(site._id, patch);
    return true;
  },
});
