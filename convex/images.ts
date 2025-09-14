import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upload and store an image
export const uploadImage = mutation({
  args: {
    imageData: v.string(), // Base64 encoded image data
    filename: v.string(),
    mimeType: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Store the image in Convex with metadata
    const imageId = await ctx.db.insert("images", {
      filename: args.filename,
      mimeType: args.mimeType,
      imageData: args.imageData,
      userId: args.userId,
      uploadedAt: Date.now(),
      size: Math.floor(args.imageData.length * 0.75), // Approximate size from base64
    });

    return imageId;
  },
});

// Get an image by ID
export const getImage = query({
  args: { imageId: v.id("images") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    return image;
  },
});

// Get all images for a user
export const getUserImages = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return [];
    }

    const images = await ctx.db
      .query("images")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();

    return images;
  },
});

// Delete an image
export const deleteImage = mutation({
  args: {
    imageId: v.id("images"),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);

    if (!image) {
      throw new Error("Image not found");
    }

    // Check if user owns the image
    if (image.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.imageId);
    return true;
  },
});