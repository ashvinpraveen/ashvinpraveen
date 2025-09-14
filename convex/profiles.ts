import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const updateProfile = mutation({
  args: {
    siteSlug: v.string(),
    title: v.optional(v.string()),
    bio: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.siteSlug))
      .first();
    if (!site) throw new Error('Site not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized to edit this site');

    await ctx.db.patch(site._id, {
      title: args.title,
      bio: args.bio,
      updatedAt: Date.now(),
    });

    return site._id;
  },
});

export const getProfile = query({
  args: { siteSlug: v.string() },
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.siteSlug))
      .first();
    if (!site) return null;

    const [projects, socialLinks] = await Promise.all([
      ctx.db
        .query('projects')
        .withIndex('by_site_order', (q) => q.eq('siteId', site._id))
        .collect(),
      ctx.db
        .query('socialLinks')
        .withIndex('by_site_order', (q) => q.eq('siteId', site._id))
        .collect(),
    ]);

    return {
      site,
      projects,
      socialLinks,
    };
  },
});

export const addProject = mutation({
  args: {
    siteSlug: v.string(),
    title: v.string(),
    description: v.string(),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.siteSlug))
      .first();
    if (!site) throw new Error('Site not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized');

    // Get the next order number
    const existingProjects = await ctx.db
      .query('projects')
      .withIndex('by_site', (q) => q.eq('siteId', site._id))
      .collect();
    const nextOrder = Math.max(...existingProjects.map(p => p.order), 0) + 1;

    const now = Date.now();
    return await ctx.db.insert('projects', {
      siteId: site._id,
      title: args.title,
      description: args.description,
      url: args.url,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id('projects'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error('Project not found');

    const site = await ctx.db.get(project.siteId);
    if (!site) throw new Error('Site not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized');

    await ctx.db.patch(args.projectId, {
      ...(args.title !== undefined && { title: args.title }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.url !== undefined && { url: args.url }),
      updatedAt: Date.now(),
    });

    return args.projectId;
  },
});

export const deleteProject = mutation({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error('Project not found');

    const site = await ctx.db.get(project.siteId);
    if (!site) throw new Error('Site not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized');

    await ctx.db.delete(args.projectId);
    return true;
  },
});

export const addSocialLink = mutation({
  args: {
    siteSlug: v.string(),
    platform: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.siteSlug))
      .first();
    if (!site) throw new Error('Site not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized');

    // Get the next order number
    const existingLinks = await ctx.db
      .query('socialLinks')
      .withIndex('by_site', (q) => q.eq('siteId', site._id))
      .collect();
    const nextOrder = Math.max(...existingLinks.map(l => l.order), 0) + 1;

    return await ctx.db.insert('socialLinks', {
      siteId: site._id,
      platform: args.platform,
      url: args.url,
      order: nextOrder,
      createdAt: Date.now(),
    });
  },
});

export const deleteSocialLink = mutation({
  args: { linkId: v.id('socialLinks') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const link = await ctx.db.get(args.linkId);
    if (!link) throw new Error('Link not found');

    const site = await ctx.db.get(link.siteId);
    if (!site) throw new Error('Site not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized');

    await ctx.db.delete(args.linkId);
    return true;
  },
});