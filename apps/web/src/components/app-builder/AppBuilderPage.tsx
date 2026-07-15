/**
 * App Builder Page
 *
 * Main page component that routes between:
 * - Landing page (no projectId): Create new projects
 * - Project view (with projectId): ProjectLoader -> ProjectSession -> AppBuilderProjectView
 *
 * - ProjectLoader: Handles async loading with tRPC/React Query
 * - ProjectSession: Manages ProjectManager lifecycle and provides context
 * - useProject/useProjectManager/useProjectState: Hooks for child components
 */

'use client';

import { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { PanelRightOpen, PanelRightClose, Eye, X } from 'lucide-react';

import { ProjectLoader } from './ProjectLoader';
import { ProjectSession, useProject } from './ProjectSession';
import { AppBuilderChat } from './AppBuilderChat';
import { AppBuilderLanding } from './AppBuilderLanding';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';

// The preview pane (iframe + sandbox polling) is heavy and only relevant once a
// project is rendering, so load it lazily.
const AppBuilderPreview = dynamic(
  () => import('./AppBuilderPreview').then(mod => mod.AppBuilderPreview),
  {
    ssr: false,
    loading: () => (
      <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
        Loading preview…
      </div>
    ),
  }
);

type AppBuilderPageProps = {
  organizationId?: string; // undefined for personal context
  projectId?: string; // undefined for new project
};

/**
 * Inner component that contains the chat and preview layout.
 * Rendered inside ProjectSession, so it has access to useProject hooks.
 *
 * Layout:
 *  - Chat always fills the width on phones.
 *  - The right preview pane is MINIMIZED by default (a narrow rail) and only
 *    enabled once the project can actually render (previewStatus === 'running'
 *    && previewUrl). On desktop it expands inline; on phones it opens as a
 *    slide-over drawer so the chat stays usable.
 */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isDesktop;
}

function AppBuilderProjectView({ organizationId }: { organizationId?: string }) {
  const { state } = useProject();
  const previewRenderable = state.previewStatus === 'running' && Boolean(state.previewUrl);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const isDesktop = useIsDesktop();

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full overflow-hidden">
      {/* Chat pane — fills the width on mobile, flex-1 on desktop */}
      <div className="relative flex h-full min-w-0 flex-1 flex-col">
        <div className="lg:hidden absolute top-2 right-2 z-10">
          <Button
            size="sm"
            variant="outline"
            disabled={!previewRenderable}
            onClick={() => setMobilePreviewOpen(true)}
          >
            <Eye className="mr-1 h-4 w-4" />
            Preview
          </Button>
        </div>
        <AppBuilderChat organizationId={organizationId} />
      </div>

      {/* Desktop right preview pane — minimized (narrow rail) by default */}
      {isDesktop && (
        <div className="hidden h-full shrink-0 border-l lg:flex">
          {previewOpen && previewRenderable ? (
            <div className="flex h-full w-[60%] max-w-[900px] min-w-[360px] flex-col">
              <div className="flex h-10 items-center justify-between border-b px-3">
                <span className="text-sm font-medium">Preview</span>
                <Button size="icon" variant="ghost" onClick={() => setPreviewOpen(false)}>
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-0 flex-1">
                <AppBuilderPreview organizationId={organizationId} />
              </div>
            </div>
          ) : (
            <div className="flex w-12 flex-col items-center py-3">
              <Button
                size="icon"
                variant="ghost"
                disabled={!previewRenderable}
                onClick={() => setPreviewOpen(true)}
                title={previewRenderable ? 'Show preview' : 'Preview not ready yet'}
              >
                <PanelRightOpen className={previewRenderable ? 'text-primary h-4 w-4' : 'h-4 w-4'} />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Mobile slide-over drawer for the preview */}
      {!isDesktop && (
        <Sheet open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-md">
            <div className="flex h-10 items-center justify-between border-b px-3">
              <span className="text-sm font-medium">Preview</span>
              <Button size="icon" variant="ghost" onClick={() => setMobilePreviewOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[calc(100%-2.5rem)]">
              <AppBuilderPreview organizationId={organizationId} />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

export function AppBuilderPage({ organizationId, projectId }: AppBuilderPageProps) {
  const router = useRouter();

  // Handle project creation from landing page
  const handleProjectCreated = useCallback(
    (createdProjectId: string, _prompt: string) => {
      // Navigate to the project page - ProjectLoader will handle loading
      const newPath = organizationId
        ? `/organizations/${organizationId}/app-builder/${createdProjectId}`
        : `/app-builder/${createdProjectId}`;
      router.replace(newPath);
    },
    [organizationId, router]
  );

  // Show landing if no projectId
  if (!projectId) {
    return (
      <AppBuilderLanding organizationId={organizationId} onProjectCreated={handleProjectCreated} />
    );
  }

  // Show project
  return (
    <ProjectLoader projectId={projectId} organizationId={organizationId ?? null}>
      {projectWithMessages => (
        <ProjectSession project={projectWithMessages} organizationId={organizationId ?? null}>
          <AppBuilderProjectView organizationId={organizationId} />
        </ProjectSession>
      )}
    </ProjectLoader>
  );
}
