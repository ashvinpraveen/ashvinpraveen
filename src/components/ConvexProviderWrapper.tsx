import { ConvexReactClient } from 'convex/react';
import { ConvexProvider } from 'convex/react';
import ImprovedConvexDataManager from './ImprovedConvexDataManager';

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

interface ConvexProviderWrapperProps {
  slug: string;
  editorId: string;
  isOwner: boolean;
  pageKey?: string;
  pageTitle?: string;
  userId?: string; // Clerk user ID
}

export default function ConvexProviderWrapper({ slug, editorId, isOwner, pageKey, pageTitle, userId }: ConvexProviderWrapperProps) {
  return (
    <ConvexProvider client={convex}>
      <ImprovedConvexDataManager
        slug={slug}
        editorId={editorId}
        isOwner={isOwner}
        pageKey={pageKey}
        pageTitle={pageTitle}
        userId={userId}
      />
    </ConvexProvider>
  );
}