import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

export const GET: APIRoute = async ({ params }) => {
  try {
    const imageId = params.imageId;

    if (!imageId) {
      return new Response('Image ID required', { status: 400 });
    }

    // Get image from Convex
    const image = await convex.query(api.images.getImage, {
      imageId: imageId as any, // Type assertion needed for Convex ID
    });

    if (!image) {
      return new Response('Image not found', { status: 404 });
    }

    // Convert base64 to buffer
    const base64Data = image.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Length': buffer.length.toString(),
      }
    });

  } catch (error) {
    console.error('Image serve error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};