import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrganizationSessionsPage({ params }: Props) {
  const { id } = await params;
  redirect(`/organizations/${decodeURIComponent(id)}/agent-builder/chat`);
}
