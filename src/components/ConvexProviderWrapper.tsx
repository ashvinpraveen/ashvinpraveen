import { ConvexReactClient } from 'convex/react';
import { ConvexProvider } from 'convex/react';
import ConvexDataManager from './ConvexDataManager';

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

interface ConvexProviderWrapperProps {
  slug: string;
  editorId: string;
  isOwner: boolean;
  pageKey?: string;
  pageTitle?: string;
}

export default function ConvexProviderWrapper({ slug, editorId, isOwner, pageKey, pageTitle }: ConvexProviderWrapperProps) {
  return (
    <ConvexProvider client={convex}>
      <ConvexDataManager slug={slug} editorId={editorId} isOwner={isOwner} pageKey={pageKey} pageTitle={pageTitle} />
    </ConvexProvider>
  );
}