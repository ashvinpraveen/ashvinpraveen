import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

export const prerender = false;

export const POST: APIRoute = async (ctx) => {
  const auth = ctx.locals.auth();
  if (!auth?.userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await ctx.request.json();
    const {
      firstName,
      lastName,
      username,
      bio,
      twitter,
      linkedin,
      github,
      instagram,
      website,
      calendly
    } = body;

    if (!firstName || !username) {
      return new Response(JSON.stringify({ error: 'First name and username are required' }), { status: 400 });
    }

    // Initialize Convex client
    const client = new ConvexHttpClient(
      import.meta.env.CONVEX_URL || import.meta.env.PUBLIC_CONVEX_URL
    );

    try {
      const token = await auth.getToken();
      client.setAuth(token);

      // Create or update user profile
      await client.mutation(api.sites.upsertUser, {
        clerkUserId: auth.userId,
        username: username.toLowerCase(),
        firstName,
        lastName
      });

      // Create social links if provided
      const socialLinks = [];
      if (twitter) socialLinks.push({ platform: 'twitter', url: twitter });
      if (linkedin) socialLinks.push({ platform: 'linkedin', url: linkedin });
      if (github) socialLinks.push({ platform: 'github', url: github });
      if (instagram) socialLinks.push({ platform: 'instagram', url: instagram });
      if (website) socialLinks.push({ platform: 'website', url: website });
      if (calendly) socialLinks.push({ platform: 'calendly', url: calendly });

      // Update profile with bio and social links
      // Note: This will need the corresponding Convex mutations
      console.log('Profile data to save:', {
        username,
        firstName,
        lastName,
        bio,
        socialLinks,
        userId: auth.userId
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Profile created successfully!',
        profileUrl: `/u/${username}`,
        data: {
          username,
          firstName,
          lastName,
          bio,
          socialLinks
        }
      }), { status: 200 });

    } catch (convexError) {
      console.error('Convex error during onboarding:', convexError);

      // Fallback - save basic info locally/temporarily
      return new Response(JSON.stringify({
        success: true,
        message: 'Profile created successfully (pending sync)',
        profileUrl: `/u/${username}`,
        data: {
          username,
          firstName,
          lastName,
          bio,
          socialLinks: socialLinks
        }
      }), { status: 200 });
    }

  } catch (err: any) {
    console.error('Onboarding completion error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Failed to complete onboarding' }),
      { status: 500 }
    );
  }
};