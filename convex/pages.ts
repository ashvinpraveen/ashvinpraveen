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

// Helper function to create content hash
function createContentHash(content: string): string {
  // Simple hash function for content comparison
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export const upsert = mutation({
  args: {
    siteSlug: v.string(),
    key: v.string(),
    title: v.string(),
    content: v.string(),
    expectedVersion: v.optional(v.number()), // For conflict detection
    userId: v.optional(v.string()) // Clerk user ID
  },
  handler: async (ctx, args) => {
    const { siteSlug, key, title, content, expectedVersion, userId } = args;

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
      const contentHash = createContentHash(content);

      if (existing) {
        // Check for conflicts if expectedVersion is provided
        // Treat undefined version as 0 for compatibility
        const currentVersion = existing.version || 0;
        if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
          throw new Error(`Conflict detected: expected version ${expectedVersion}, but current version is ${currentVersion}`);
        }

        // Only update if content actually changed
        if (existing.contentHash !== contentHash) {
          const newVersion = (existing.version || 0) + 1;
          await ctx.db.patch(existing._id, {
            title,
            content,
            version: newVersion,
            contentHash,
            lastEditedBy: userId,
            updatedAt: now
          });
          return { id: existing._id, version: newVersion, contentHash };
        }
        return { id: existing._id, version: existing.version || 0, contentHash };
      }

      const pageId = await ctx.db.insert('pages', {
        siteId: site!._id,
        key,
        title,
        content,
        version: 1,
        contentHash,
        lastEditedBy: userId,
        updatedAt: now
      });
      return { id: pageId, version: 1, contentHash };
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
    const contentHash = createContentHash(content);

    if (existing) {
      // Check for conflicts if expectedVersion is provided
      // Treat undefined version as 0 for compatibility
      const currentVersion = existing.version || 0;
      if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
        throw new Error(`Conflict detected: expected version ${expectedVersion}, but current version is ${currentVersion}`);
      }

      // Only update if content actually changed
      if (existing.contentHash !== contentHash) {
        const newVersion = (existing.version || 0) + 1;
        await ctx.db.patch(existing._id, {
          title,
          content,
          version: newVersion,
          contentHash,
          lastEditedBy: userId,
          updatedAt: now
        });
        return { id: existing._id, version: newVersion, contentHash };
      }
      return { id: existing._id, version: existing.version || 0, contentHash };
    }

    const pageId = await ctx.db.insert('pages', {
      siteId: site._id,
      key,
      title,
      content,
      version: 1,
      contentHash,
      lastEditedBy: userId,
      updatedAt: now
    });
    return { id: pageId, version: 1, contentHash };
  },
});

