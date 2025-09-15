import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const listBySite = query({
  args: { siteSlug: v.string() },
  handler: async (ctx, args) => {
    const { siteSlug } = args;
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) return [];
    return ctx.db
      .query('posts')
      .withIndex('by_site', (q) => q.eq('siteId', site._id))
      .collect();
  },
});

export const getBySlug = query({
  args: { siteSlug: v.string(), slug: v.string() },
  handler: async (ctx, args) => {
    const { siteSlug, slug } = args;
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) return null;
    return ctx.db
      .query('posts')
      .withIndex('by_site_slug', (q) => q.eq('siteId', site._id).eq('slug', slug))
      .first();
  },
});

export const getByUniqueId = query({
  args: { siteSlug: v.string(), uniqueId: v.string() },
  handler: async (ctx, args) => {
    const { siteSlug, uniqueId } = args;
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) return null;
    return ctx.db
      .query('posts')
      .withIndex('by_site_unique_id', (q) => q.eq('siteId', site._id).eq('uniqueId', uniqueId))
      .first();
  },
});

export const createPost = mutation({
  args: { title: v.string(), slug: v.string(), content: v.string(), description: v.optional(v.string()), siteSlug: v.optional(v.string()), uniqueId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { title, slug, content, description, siteSlug, uniqueId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', clerkUserId))
      .first();
    if (!user) throw new Error('User not found');

    let site = null as any;
    if (siteSlug) {
      site = await ctx.db
        .query('sites')
        .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
        .first();
      if (!site || site.ownerId !== user._id) throw new Error('Invalid site');
    } else {
      // default to the first site owned by user
      site = await ctx.db
        .query('sites')
        .withIndex('by_owner', (q) => q.eq('ownerId', user._id))
        .first();
      if (!site) throw new Error('No site found');
    }

    const now = Date.now();
    return await ctx.db.insert('posts', {
      siteId: site._id,
      uniqueId: uniqueId || `post-${now}`, // Generate a default uniqueId if not provided
      title,
      slug,
      content,
      description,
      published: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const upsertBySlug = mutation({
  args: { siteSlug: v.string(), slug: v.string(), title: v.string(), content: v.string(), description: v.optional(v.string()), published: v.optional(v.boolean()), publishedAt: v.optional(v.number()), createdAt: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const { siteSlug, slug, title, content, description, published, publishedAt, createdAt } = args;
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) throw new Error('Site not found');
    const existing = await ctx.db
      .query('posts')
      .withIndex('by_site_slug', (q) => q.eq('siteId', site._id).eq('slug', slug))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title,
        content,
        description,
        published: published ?? existing.published,
        publishedAt: publishedAt ?? existing.publishedAt,
        updatedAt: now,
      });
      return existing._id;
    }
    return await ctx.db.insert('posts', {
      siteId: site._id,
      uniqueId: `post-${now}`, // Generate a default uniqueId for new posts
      slug,
      title,
      content,
      description,
      published: published ?? false,
      publishedAt,
      createdAt: createdAt ?? now,
      updatedAt: now,
    });
  },
});

export const upsertByUniqueId = mutation({
  args: { siteSlug: v.string(), uniqueId: v.string(), slug: v.string(), title: v.string(), content: v.string(), description: v.optional(v.string()), published: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const { siteSlug, uniqueId, slug, title, content, description, published } = args;

    // Get the identity to check authorization
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', clerkUserId))
      .first();
    if (!user) throw new Error('User not found');

    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) throw new Error('Site not found');
    if (site.ownerId !== user._id) throw new Error('Unauthorized to edit this site');

    // Check if post exists by uniqueId
    const existing = await ctx.db
      .query('posts')
      .withIndex('by_site_unique_id', (q) => q.eq('siteId', site._id).eq('uniqueId', uniqueId))
      .first();

    const now = Date.now();

    if (existing) {
      // Update existing post
      await ctx.db.patch(existing._id, {
        slug,
        title,
        content,
        description,
        published: published ?? existing.published,
        updatedAt: now,
      });
      return existing._id;
    } else {
      // Create new post
      return await ctx.db.insert('posts', {
        siteId: site._id,
        uniqueId,
        slug,
        title,
        content,
        description,
        published: published ?? false,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

export const publishToggle = mutation({
  args: { siteSlug: v.string(), slug: v.string(), published: v.boolean() },
  handler: async (ctx, args) => {
    const { siteSlug, slug, published } = args;
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) throw new Error('Site not found');
    const post = await ctx.db
      .query('posts')
      .withIndex('by_site_slug', (q) => q.eq('siteId', site._id).eq('slug', slug))
      .first();
    if (!post) throw new Error('Post not found');
    await ctx.db.patch(post._id, { published, publishedAt: published ? Date.now() : undefined });
  }
});

export const publishToggleByUniqueId = mutation({
  args: { siteSlug: v.string(), uniqueId: v.string(), published: v.boolean() },
  handler: async (ctx, args) => {
    const { siteSlug, uniqueId, published } = args;

    // Get the identity to check authorization
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', clerkUserId))
      .first();
    if (!user) throw new Error('User not found');

    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) throw new Error('Site not found');
    if (site.ownerId !== user._id) throw new Error('Unauthorized to edit this site');

    const post = await ctx.db
      .query('posts')
      .withIndex('by_site_unique_id', (q) => q.eq('siteId', site._id).eq('uniqueId', uniqueId))
      .first();
    if (!post) throw new Error('Post not found');

    await ctx.db.patch(post._id, {
      published,
      publishedAt: published ? Date.now() : undefined,
      updatedAt: Date.now()
    });
  }
});

export const deleteBySlug = mutation({
  args: { slug: v.string(), siteSlug: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', clerkUserId))
      .first();
    if (!user) throw new Error('User not found');
    let site = null as any;
    if (args.siteSlug) {
      site = await ctx.db.query('sites').withIndex('by_slug', (q) => q.eq('slug', args.siteSlug!)).first();
    } else {
      site = await ctx.db.query('sites').withIndex('by_owner', (q) => q.eq('ownerId', user._id)).first();
    }
    if (!site) throw new Error('No site');
    const post = await ctx.db
      .query('posts')
      .withIndex('by_site_slug', (q) => q.eq('siteId', site._id).eq('slug', args.slug))
      .first();
    if (!post) return;
    await ctx.db.delete(post._id);
  }
});

export const deleteByUniqueId = mutation({
  args: { uniqueId: v.string(), siteSlug: v.string() },
  handler: async (ctx, args) => {
    const { uniqueId, siteSlug } = args;

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const clerkUserId = identity.subject;
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', clerkUserId))
      .first();
    if (!user) throw new Error('User not found');

    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', siteSlug))
      .first();
    if (!site) throw new Error('Site not found');
    if (site.ownerId !== user._id) throw new Error('Unauthorized to delete from this site');

    const post = await ctx.db
      .query('posts')
      .withIndex('by_site_unique_id', (q) => q.eq('siteId', site._id).eq('uniqueId', uniqueId))
      .first();
    if (!post) return;

    await ctx.db.delete(post._id);
  }
});
