import { redirect } from 'next/navigation';
import { isNewSession } from '@/lib/cloud-agent/session-type';
import { LegacySessionViewer } from '@/components/cloud-agent-next/LegacySessionViewer';
import { CloudChatPageWrapperNext } from './CloudChatPageWrapperNext';
import { CloudAgentProvider } from '@/components/cloud-agent-next/CloudAgentProvider';
import { CloudSidebarLayout } from '@/components/cloud-agent-next/CloudSidebarLayout';
import { getAuthorizedOrgContext } from '@/lib/organizations/organization-auth';
import { signInUrlWithCallbackPath } from '@/lib/user/server';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function OrgAgentBuilderChatPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const organizationId = decodeURIComponent(id);

  const result = await getAuthorizedOrgContext(organizationId);
  if (!result.success) {
    if (result.nextResponse.status === 401) {
      redirect(await signInUrlWithCallbackPath());
    }
    redirect('/profile');
  }

  const { sessionId } = await searchParams;
  const isLegacy = sessionId && !isNewSession(sessionId);

  return (
    <CloudAgentProvider>
      <CloudSidebarLayout organizationId={organizationId}>
        {isLegacy ? (
          <LegacySessionViewer sessionId={sessionId} organizationId={organizationId} />
        ) : (
          <CloudChatPageWrapperNext organizationId={organizationId} />
        )}
      </CloudSidebarLayout>
    </CloudAgentProvider>
  );
}
