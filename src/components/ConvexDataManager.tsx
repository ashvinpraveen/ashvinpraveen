import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ConvexDataManagerProps {
  slug: string;
  editorId: string;
  isOwner: boolean;
  pageKey?: string; // Optional page key for differentiation
  pageTitle?: string; // Optional page title
}

export default function ConvexDataManager({ slug, editorId, isOwner, pageKey, pageTitle }: ConvexDataManagerProps) {
  console.log('🔄 ConvexDataManager loading with props:', { slug, editorId, isOwner, pageKey, pageTitle });
  console.log('🔍 Component render count:', Math.random()); // Debug: see if component re-renders
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isSavingRef = useRef<boolean>(false);

  // Create unique storage key for this page
  const storageKey = pageKey || slug;
  console.log('🗝️ Current storage key:', storageKey);

  // Live query for content - automatically updates when data changes
  const pageContent = useQuery(api.pages.getByKey, { siteSlug: slug, key: storageKey });
  console.log('📊 Convex query result for key:', storageKey, pageContent);

  // Track if we're loading content for the current page
  const isLoadingContent = pageContent === undefined;
  const previousStorageKey = useRef<string>(storageKey);

  // Mutation for saving content
  const updatePage = useMutation(api.pages.upsert);

  // Detect page transitions and clear stale content
  useEffect(() => {
    if (previousStorageKey.current !== storageKey) {
      console.log('🔄 Page transition detected:', previousStorageKey.current, '→', storageKey);

      // Clear editor content temporarily to prevent flash of wrong content
      if (typeof window !== 'undefined') {
        const globalWindow = window as {[key: string]: any};
        const editorInstance = globalWindow[`${editorId}Editor`];
        if (editorInstance && editorInstance.getEditor()) {
          console.log('🧹 Clearing editor content during transition');
          editorInstance.setContent('<p>Loading...</p>');
        }
      }

      previousStorageKey.current = storageKey;
    }
  }, [storageKey, editorId]);

  // When content changes from Convex, update the editor (but not if we're currently saving)
  useEffect(() => {
    if (pageContent?.content && typeof window !== 'undefined' && !isSavingRef.current) {
      const globalWindow = window as {[key: string]: any};
      const editorInstance = globalWindow[`${editorId}Editor`];
      if (editorInstance && editorInstance.getEditor()) {
        const currentContent = editorInstance.getContent();
        // Only update if content is significantly different (avoid cursor jumps from minor formatting differences)
        if (currentContent !== pageContent.content && currentContent !== '<p>Loading...</p>') {
          console.log('🔄 Updating editor from Convex (external change detected for key:', storageKey, ')');
          editorInstance.setContent(pageContent.content);
        } else if (currentContent === '<p>Loading...</p>') {
          console.log('🎯 Loading new content for key:', storageKey);
          editorInstance.setContent(pageContent.content);
        }
      }
    } else if (isLoadingContent) {
      console.log('⏳ Waiting for content to load for key:', storageKey);
    }
  }, [pageContent?.content, editorId, storageKey, isSavingRef]);

  // Expose save function to window for the Astro component to use
  useEffect(() => {
    const saveToConvex = async (content: string) => {
      if (!isOwner) return;

      try {
        isSavingRef.current = true; // Prevent content updates during save
        await updatePage({
          siteSlug: slug,
          key: storageKey,
          title: pageTitle || 'Page',
          content
        });
        console.log('✅ Content saved to Convex via live mutation');

        // Wait a moment for Convex to process, then allow updates again
        setTimeout(() => {
          isSavingRef.current = false;
        }, 100);
      } catch (error) {
        console.error('❌ Failed to save to Convex:', error);
        isSavingRef.current = false; // Reset flag on error
      }
    };

    const debouncedSave = (content: string) => {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveToConvex(content);
      }, 2000);
    };

    // Expose to window for Astro component
    const globalWindow = window as {[key: string]: any};
    globalWindow.convexDataManager = {
      saveContent: debouncedSave,
      isConnected: true
    };

    return () => {
      clearTimeout(saveTimeoutRef.current);
      delete globalWindow.convexDataManager;
    };
  }, [slug, updatePage, isOwner]);

  return null; // This is a headless data management component
}