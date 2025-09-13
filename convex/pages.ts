import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const getByKey = query({
  args: { siteSlug: v.string(), key: v.string() },
  handler: async (ctx, args) => {
    const { siteSlug, key } = args;
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) return null;
    return ctx.db
      .query('pages')
      .withIndex('by_site_key', (q) => q.eq('siteId', site._id).eq('key', key))
      .first();
  },
});

export const upsert = mutation({
  args: { siteSlug: v.string(), key: v.string(), title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const { siteSlug, key, title, content } = args;
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) throw new Error('Site not found');
    const existing = await ctx.db
      .query('pages')
      .withIndex('by_site_key', (q) => q.eq('siteId', site._id).eq('key', key))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { title, content, updatedAt: now });
      return existing._id;
    }
    return await ctx.db.insert('pages', { siteId: site._id, key, title, content, updatedAt: now });
  },
});

