import { redirect } from 'next/navigation';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function OrganizationCloudChatPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { sessionId } = await searchParams;
  const organizationId = decodeURIComponent(id);
  redirect(
    sessionId
      ? `/organizations/${organizationId}/agent-builder/chat?sessionId=${sessionId}`
      : `/organizations/${organizationId}/agent-builder/chat`
  );
}
