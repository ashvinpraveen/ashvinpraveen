import { useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ConvexDataManagerProps {
  slug: string;
  editorId: string;
  isOwner: boolean;
}

export default function ConvexDataManager({ slug, editorId, isOwner }: ConvexDataManagerProps) {
  console.log('🔄 ConvexDataManager loading with props:', { slug, editorId, isOwner });
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isSavingRef = useRef<boolean>(false);

  // Live query for content - automatically updates when data changes
  const pageContent = useQuery(api.pages.getBySlug, { slug });
  console.log('📊 Convex query result:', pageContent);

  // Mutation for saving content
  const updatePage = useMutation(api.pages.upsert);

  // When content changes from Convex, update the editor (but not if we're currently saving)
  useEffect(() => {
    if (pageContent?.content && typeof window !== 'undefined' && !isSavingRef.current) {
      const globalWindow = window as {[key: string]: any};
      const editorInstance = globalWindow[`${editorId}Editor`];
      if (editorInstance && editorInstance.getEditor()) {
        const currentContent = editorInstance.getContent();
        // Only update if content is significantly different (avoid cursor jumps from minor formatting differences)
        if (currentContent !== pageContent.content) {
          console.log('🔄 Updating editor from Convex (external change detected)');
          editorInstance.setContent(pageContent.content);
        }
      }
    }
  }, [pageContent?.content, editorId]);

  // Expose save function to window for the Astro component to use
  useEffect(() => {
    const saveToConvex = async (content: string) => {
      if (!isOwner) return;

      try {
        isSavingRef.current = true; // Prevent content updates during save
        await updatePage({
          siteSlug: slug,
          key: slug,
          title: 'About',
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