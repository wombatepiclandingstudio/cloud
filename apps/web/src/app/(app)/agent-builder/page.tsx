import { notFound } from 'next/navigation';
import { isFeatureFlagEnabled } from '@/lib/posthog-feature-flags';
import { getUserFromAuthOrRedirect } from '@/lib/user/server';
import { AgentBuilderLanding } from '@/components/agent-builder/AgentBuilderLanding';

export default async function AgentBuilderLandingPage() {
  const user = await getUserFromAuthOrRedirect('/users/sign_in?callbackPath=/agent-builder');
  const isAppBuilderEnabled = await isFeatureFlagEnabled('app-builder-feature', user.id);
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isAppBuilderEnabled && !isDevelopment) {
    return notFound();
  }

  return <AgentBuilderLanding organizationId={undefined} />;
}
