import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

const RESERVED_SLUGS = new Set([
  'about','blog','app','sign-in','sign-up','onboarding','api','rss','rss.xml','sitemap','sitemap.xml','robots.txt','favicon.ico'
]);

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

// Resolve a slug to a site, following alias redirects.
export const resolveSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Try direct match first
    const direct = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (direct) {
      return { site: direct, redirect: false, canonicalSlug: direct.slug };
    }
    // Then check aliases
    const alias = await ctx.db
      .query('siteAliases')
      .withIndex('by_old_slug', (q) => q.eq('oldSlug', args.slug))
      .first();
    if (!alias) return null;
    const site = await ctx.db.get(alias.siteId);
    if (!site) return null;
    return { site, redirect: true, canonicalSlug: site.slug };
  },
});

export const checkSlugAvailability = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const raw = args.slug.trim();
    const normalized = raw.toLowerCase();
    const valid = /^[a-z0-9-]{3,30}$/.test(normalized);
    if (!valid) return { available: false, reason: 'Invalid format. Use 3-30 chars: a-z, 0-9, -' };
    if (RESERVED_SLUGS.has(normalized)) return { available: false, reason: 'Reserved URL' };
    const existing = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', normalized))
      .first();
    if (existing) return { available: false, reason: 'Taken' };
    const aliasHit = await ctx.db
      .query('siteAliases')
      .withIndex('by_old_slug', (q) => q.eq('oldSlug', normalized))
      .first();
    if (aliasHit) return { available: false, reason: 'Taken (alias)' };
    return { available: true };
  },
});

export const changeSlug = mutation({
  args: { currentSlug: v.string(), newSlug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const current = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.currentSlug))
      .first();
    if (!current) throw new Error('Site not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || current.ownerId !== user._id) throw new Error('Not authorized');

    const raw = args.newSlug.trim();
    const normalized = raw.toLowerCase();
    const valid = /^[a-z0-9-]{3,30}$/.test(normalized);
    if (!valid) throw new Error('Invalid slug format');
    if (RESERVED_SLUGS.has(normalized)) throw new Error('Slug is reserved');

    // If slug unchanged, no-op
    if (normalized === current.slug) return { ok: true, slug: current.slug, changed: false };

    // Ensure not taken
    const conflict = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', normalized))
      .first();
    if (conflict) throw new Error('Slug already taken');
    const aliasConflict = await ctx.db
      .query('siteAliases')
      .withIndex('by_old_slug', (q) => q.eq('oldSlug', normalized))
      .first();
    if (aliasConflict) throw new Error('Slug already taken');

    // Create alias for old slug and update site
    await ctx.db.insert('siteAliases', {
      siteId: current._id,
      oldSlug: current.slug,
      createdAt: Date.now(),
    });
    await ctx.db.patch(current._id, { slug: normalized, updatedAt: Date.now() });
    // Optionally update user's username mirror if stored
    await ctx.db.patch(user._id, { username: normalized });

    return { ok: true, slug: normalized, changed: true };
  },
});

function normalizeDomain(raw: string) {
  try {
    let d = (raw || '').trim().toLowerCase();
    d = d.replace(/^https?:\/\//, '');
    d = d.replace(/\/$/, '');
    d = d.replace(/\.$/, '');
    return d;
  } catch {
    return raw;
  }
}

export const checkDomainAvailability = query({
  args: { domain: v.string() },
  handler: async (ctx, args) => {
    const domain = normalizeDomain(args.domain);
    if (!/^[a-z0-9.-]+$/.test(domain) || domain.length < 3) {
      return { available: false, reason: 'Invalid domain' };
    }
    const inUse = await ctx.db
      .query('sites')
      .filter((q) => q.eq(q.field('customDomain'), domain))
      .first();
    if (inUse) return { available: false, reason: 'Domain already in use' };
    return { available: true };
  },
});

export const setCustomDomain = mutation({
  args: { slug: v.string(), domain: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (!site) throw new Error('Site not found');

    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized');

    const patch: any = { updatedAt: Date.now() };
    if (!args.domain) {
      patch.customDomain = undefined;
      patch.domainStatus = 'none';
      patch.domainVerificationToken = undefined;
      patch.domainVerifiedAt = undefined;
      patch.lastDomainError = undefined;
      await ctx.db.patch(site._id, patch);
      return { ok: true, customDomain: undefined };
    }

    const domain = normalizeDomain(args.domain);
    // Uniqueness
    const conflict = await ctx.db
      .query('sites')
      .filter((q) => q.eq(q.field('customDomain'), domain))
      .first();
    if (conflict && conflict._id !== site._id) throw new Error('Domain already in use');

    let token = site.domainVerificationToken;
    if (!token) {
      token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    }
    patch.customDomain = domain;
    patch.domainVerificationToken = token;
    patch.domainStatus = 'pending_dns';
    patch.lastDomainError = undefined;
    await ctx.db.patch(site._id, patch);
    return { ok: true, customDomain: domain, token };
  },
});

export const updateDomainStatus = mutation({
  args: {
    slug: v.string(),
    status: v.string(),
    lastError: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');
    const site = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();
    if (!site) throw new Error('Site not found');
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkUserId', identity.subject))
      .first();
    if (!user || site.ownerId !== user._id) throw new Error('Not authorized');
    await ctx.db.patch(site._id, {
      domainStatus: args.status,
      lastDomainError: args.lastError,
      domainVerifiedAt: args.verifiedAt,
      updatedAt: Date.now(),
    });
    return true;
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

// Ensure homepage site exists for public pages
export const ensureHomepageSite = mutation({
  args: {},
  handler: async (ctx, args) => {
    const homepageSlug = 'homepage';

    // Check if homepage site already exists
    const existing = await ctx.db
      .query('sites')
      .withIndex('by_slug', (q) => q.eq('slug', homepageSlug))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create homepage site - find admin user or create one
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
      slug: homepageSlug,
      title: 'Ashvin Praveen',
      bio: 'Builder at heart — code, products, and ideas.',
      createdAt: now,
      updatedAt: now
    });

    return siteId;
  },
});
