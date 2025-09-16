import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ImprovedConvexDataManagerProps {
  slug: string;
  editorId: string;
  isOwner: boolean;
  pageKey?: string;
  pageTitle?: string;
  userId?: string; // Clerk user ID
}

interface SaveState {
  isSaving: boolean;
  lastSaveVersion: number;
  lastSaveHash: string;
  pendingSave: boolean;
}

export default function ImprovedConvexDataManager({
  slug,
  editorId,
  isOwner,
  pageKey,
  pageTitle,
  userId
}: ImprovedConvexDataManagerProps) {

  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const saveStateRef = useRef<SaveState>({
    isSaving: false,
    lastSaveVersion: 0,
    lastSaveHash: '',
    pendingSave: false
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Create unique storage key for this page
  const storageKey = pageKey || slug;
  const previousStorageKey = useRef<string>(storageKey);

  // Live query for content - automatically updates when data changes
  const pageContent = useQuery(api.pages.getByKey, { siteSlug: slug, key: storageKey });

  // Track if we're loading content for the current page
  const isLoadingContent = pageContent === undefined;

  // Mutation for saving content with conflict resolution
  const updatePage = useMutation(api.pages.upsert);

  // Helper function to create content hash (matches server-side)
  const createContentHash = (content: string): string => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  };

  // Normalize HTML content for comparison
  const normalizeContent = (content: string): string => {
    // Remove extra whitespace and normalize formatting
    return content
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  };

  // Check if content has semantically changed
  const hasContentChanged = (currentContent: string, serverContent: string): boolean => {
    const normalizedCurrent = normalizeContent(currentContent);
    const normalizedServer = normalizeContent(serverContent);
    return normalizedCurrent !== normalizedServer;
  };

  // Detect page transitions and clear stale content
  useEffect(() => {
    if (previousStorageKey.current !== storageKey) {
      console.log('🔄 Page transition detected:', previousStorageKey.current, '→', storageKey);

      // Reset save state for new page
      saveStateRef.current = {
        isSaving: false,
        lastSaveVersion: 0,
        lastSaveHash: '',
        pendingSave: false
      };
      setIsInitialized(false);

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

  // When content changes from Convex, update the editor (with conflict resolution)
  useEffect(() => {
    if (pageContent?.content && typeof window !== 'undefined') {
      const globalWindow = window as {[key: string]: any};
      const editorInstance = globalWindow[`${editorId}Editor`];

      if (editorInstance && editorInstance.getEditor()) {
        const currentContent = editorInstance.getContent();
        const serverContent = pageContent.content;

        // Initialize on first load
        if (!isInitialized) {
          console.log('🎯 Initial content load for key:', storageKey);
          editorInstance.setContent(serverContent);
          saveStateRef.current.lastSaveVersion = pageContent.version || 0;
          saveStateRef.current.lastSaveHash = pageContent.contentHash || '';
          setIsInitialized(true);
          return;
        }

        // Skip update if we're currently saving (prevent overwriting user changes)
        if (saveStateRef.current.isSaving) {
          console.log('⏸️ Skipping content update - save in progress');
          return;
        }

        // Check if this is our own change coming back
        const serverHash = pageContent.contentHash || '';
        if (serverHash === saveStateRef.current.lastSaveHash) {
          console.log('✅ Received our own save back, updating version');
          saveStateRef.current.lastSaveVersion = pageContent.version || 0;
          return;
        }

        // Check if server content has actually changed
        if (!hasContentChanged(currentContent, serverContent)) {
          console.log('📝 Content semantically identical, skipping update');
          saveStateRef.current.lastSaveVersion = pageContent.version || 0;
          saveStateRef.current.lastSaveHash = serverHash;
          return;
        }

        // External change detected - update editor
        console.log('🔄 External change detected, updating editor for key:', storageKey);
        editorInstance.setContent(serverContent);
        saveStateRef.current.lastSaveVersion = pageContent.version || 0;
        saveStateRef.current.lastSaveHash = serverHash;
      }
    } else if (isLoadingContent) {
      console.log('⏳ Waiting for content to load for key:', storageKey);
    }
  }, [pageContent?.content, pageContent?.version, pageContent?.contentHash, editorId, storageKey, isInitialized]);

  // Expose save function to window for the Astro component to use
  useEffect(() => {
    const saveToConvex = async (content: string) => {
      if (!isOwner || !isInitialized) return;

      try {
        // Prevent multiple simultaneous saves
        if (saveStateRef.current.isSaving) {
          console.log('⏸️ Save already in progress, queuing...');
          saveStateRef.current.pendingSave = true;
          return;
        }

        const contentHash = createContentHash(content);

        // Skip save if content hasn't actually changed
        if (contentHash === saveStateRef.current.lastSaveHash) {
          console.log('📝 Content unchanged, skipping save');
          return;
        }

        saveStateRef.current.isSaving = true;
        saveStateRef.current.pendingSave = false;

        console.log('💾 Saving content to Convex...', {
          expectedVersion: saveStateRef.current.lastSaveVersion,
          contentHash
        });

        const result = await updatePage({
          siteSlug: slug,
          key: storageKey,
          title: pageTitle || 'Page',
          content,
          expectedVersion: saveStateRef.current.lastSaveVersion,
          userId
        });

        console.log('✅ Content saved successfully', result);

        // Update our tracking
        saveStateRef.current.lastSaveVersion = result.version;
        saveStateRef.current.lastSaveHash = result.contentHash;

      } catch (error) {
        if (error instanceof Error && error.message.includes('Conflict detected')) {
          console.warn('⚠️ Save conflict detected - content was updated by another source');
          // Don't throw - let the live query handle the update
        } else {
          console.error('❌ Failed to save to Convex:', error);
        }
      } finally {
        saveStateRef.current.isSaving = false;

        // Process any pending save
        if (saveStateRef.current.pendingSave) {
          console.log('🔄 Processing pending save...');
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              const globalWindow = window as {[key: string]: any};
              const editorInstance = globalWindow[`${editorId}Editor`];
              if (editorInstance && editorInstance.getEditor()) {
                const currentContent = editorInstance.getContent();
                saveToConvex(currentContent);
              }
            }
          }, 100);
        }
      }
    };

    const debouncedSave = (content: string) => {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveToConvex(content);
      }, 1500); // Reduced from 2000ms for more responsive autosave
    };

    // Expose to window for Astro component
    const globalWindow = window as {[key: string]: any};
    globalWindow.convexDataManager = {
      saveContent: debouncedSave,
      isConnected: true,
      getState: () => saveStateRef.current
    };

    return () => {
      clearTimeout(saveTimeoutRef.current);
      delete globalWindow.convexDataManager;
    };
  }, [slug, updatePage, isOwner, storageKey, pageTitle, userId, isInitialized]);

  return null; // This is a headless data management component
}