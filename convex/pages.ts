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

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const { slug } = args;
    // For about pages, we'll use the slug as both siteSlug and key
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .first();
    if (!site) return null;
    return ctx.db
      .query('pages')
      .withIndex('by_site_key', (q) => q.eq('siteId', site._id).eq('key', slug))
      .first();
  },
});

export const upsert = mutation({
  args: { siteSlug: v.string(), key: v.string(), title: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    const { siteSlug, key, title, content } = args;

    // Special handling for homepage site - ensure it exists
    if (siteSlug === 'homepage') {
      let site = await ctx.db
        .query('sites')
        .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
        .first();

      if (!site) {
        // Create homepage site automatically - find admin user or create one
        let adminUser = await ctx.db
          .query('users')
          .withIndex('by_username', (q) => q.eq('username', 'ashvin'))
          .first();

        if (!adminUser) {
          // Create admin user if it doesn't exist
          const adminUserId = await ctx.db.insert('users', {
            clerkUserId: 'admin-homepage',
            username: 'ashvin',
            createdAt: Date.now()
          });
          adminUser = await ctx.db.get(adminUserId);
        }

        const now = Date.now();
        const siteId = await ctx.db.insert('sites', {
          ownerId: adminUser!._id,
          name: 'Homepage',
          slug: siteSlug,
          title: 'Ashvin Praveen',
          bio: 'Builder at heart — code, products, and ideas.',
          createdAt: now,
          updatedAt: now
        });
        site = await ctx.db.get(siteId);
      }

      const existing = await ctx.db
        .query('pages')
        .withIndex('by_site_key', (q) => q.eq('siteId', site!._id).eq('key', key))
        .first();
      const now = Date.now();
      if (existing) {
        await ctx.db.patch(existing._id, { title, content, updatedAt: now });
        return existing._id;
      }
      return await ctx.db.insert('pages', { siteId: site!._id, key, title, content, updatedAt: now });
    }

    // Regular site handling
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

