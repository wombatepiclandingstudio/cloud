import { redirect } from 'next/navigation';

type PageProps = {
  searchParams: Promise<{ sessionId?: string }>;
};

export default async function PersonalCloudChatPage({ searchParams }: PageProps) {
  const { sessionId } = await searchParams;
  redirect(sessionId ? `/agent-builder/chat?sessionId=${sessionId}` : '/agent-builder/chat');
}
