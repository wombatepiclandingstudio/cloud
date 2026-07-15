import { getUserFromAuthOrRedirect } from '@/lib/user/server';
import { isNewSession } from '@/lib/cloud-agent/session-type';
import { LegacySessionViewer } from '@/components/cloud-agent-next/LegacySessionViewer';
import { CloudChatPageWrapperNext } from './CloudChatPageWrapperNext';
import { CloudAgentProvider } from '@/components/cloud-agent-next/CloudAgentProvider';
import { CloudSidebarLayout } from '@/components/cloud-agent-next/CloudSidebarLayout';

type PageProps = {
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function AgentBuilderChatPage({ searchParams }: PageProps) {
  await getUserFromAuthOrRedirect('/users/sign_in?callbackPath=/agent-builder/chat');
  const { sessionId } = await searchParams;

  const isLegacy = sessionId && !isNewSession(sessionId);

  return (
    <CloudAgentProvider>
      <CloudSidebarLayout>
        {isLegacy ? (
          <LegacySessionViewer sessionId={sessionId} />
        ) : (
          <CloudChatPageWrapperNext />
        )}
      </CloudSidebarLayout>
    </CloudAgentProvider>
  );
}
