import type { APIRoute } from 'astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api.js';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

export const POST: APIRoute = async ({ request }) => {
  try {
    const { imageData, filename, mimeType, userId } = await request.json();

    console.log('Upload request received:', { filename, mimeType, userId, imageDataSize: imageData?.length });

    if (!imageData || !filename || !mimeType) {
      console.log('Missing required fields:', { imageData: !!imageData, filename: !!filename, mimeType: !!mimeType });
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Attempting to upload to Convex...');
    // Upload image to Convex
    const imageId = await convex.mutation(api.images.uploadImage, {
      imageData,
      filename,
      mimeType,
      userId: userId || undefined,
    });
    console.log('Upload successful, imageId:', imageId);

    // Create a URL that can serve the image
    const imageUrl = `/api/images/${imageId}`;

    return new Response(
      JSON.stringify({
        success: true,
        imageId,
        imageUrl
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Image upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload image' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};