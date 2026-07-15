'use client';

import { Bot, Plus, Cloud } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SetPageTitle } from '@/components/SetPageTitle';

type AgentBuilderLandingProps = {
  organizationId?: string;
};

/**
 * Unified entry point for the "Agent & Builder" destination.
 *
 * Two entry flows, both composing the existing proven surfaces:
 *  - Start a session  → Cloud Agent (agentic coding + terminal)
 *  - Build an app     → App Builder (preview + deploy)
 *
 * The chat surfaces themselves use different runtime contexts (Cloud Agent's
 * SessionManager vs App Builder's ProjectManager), so they are composed here
 * rather than merged into a single component.
 */
export function AgentBuilderLanding({ organizationId }: AgentBuilderLandingProps) {
  const cloudHref = organizationId ? `/organizations/${organizationId}/agent-builder/chat` : '/agent-builder/chat';
  const appHref = organizationId ? `/organizations/${organizationId}/app-builder` : '/app-builder';

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] w-full flex-col items-center justify-center overflow-y-auto p-4 md:p-8">
      <div className="my-auto w-full max-w-3xl">
        <div className="mb-10 text-center">
          <SetPageTitle title="Agent & Builder" />
          <h1 className="text-2xl font-semibold tracking-tight">Agent & Builder</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Start a coding session or build a full app — one workspace for both.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href={cloudHref} className="group rounded-xl focus:outline-none">
            <Card className="group-hover:border-primary h-full transition-colors">
              <CardHeader>
                <div className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Cloud className="h-5 w-5" />
                </div>
                <CardTitle className="flex items-center gap-2 text-lg">Start a session</CardTitle>
                <CardDescription>
                  Agentic coding on your repo with a live terminal.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Pick a repo, model, and mode — Kilo runs the task and streams progress.
              </CardContent>
            </Card>
          </Link>

          <Link href={appHref} className="group rounded-xl focus:outline-none">
            <Card className="group-hover:border-primary h-full transition-colors">
              <CardHeader>
                <div className="bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary mb-3 flex h-10 w-10 items-center justify-center rounded-lg">
                  <Plus className="h-5 w-5" />
                </div>
                <CardTitle className="flex items-center gap-2 text-lg">Build an app</CardTitle>
                <CardDescription>
                  Describe an app and watch it build with a live preview.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Templates, git, and one-click deploy included.
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="text-muted-foreground mt-8 text-center text-xs">
          <Bot className="mr-1 inline h-3 w-3" />
          Powered by Cloud Agent.
        </p>
      </div>
    </div>
  );
}
