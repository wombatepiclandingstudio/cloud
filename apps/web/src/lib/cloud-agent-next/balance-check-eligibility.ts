import 'server-only';
import { type db } from '@/lib/drizzle';
import { isFreeModel } from '@/lib/ai-gateway/is-free-model';
import { isKiloExclusiveModel } from '@/lib/ai-gateway/models';
import {
  getModelUserByokProviders,
  getOrganizationByokProviderIds,
  getUserByokProviderIds,
} from '@/lib/ai-gateway/byok';
import type { User } from '@kilocode/db/schema';

export type BalanceCheckModelEligibility = {
  isFree: boolean;
  hasUserByokAvailable: boolean;
};

/**
 * Decide whether `prepareSession` should skip the worker-side $1 balance
 * minimum for the chosen model.
 *
 * Skips the check when either:
 * - the model is Kilo-funded (free for the user), or
 * - the user has a BYOK provider configured that can serve the model, so
 *   the session is billed against the user's own key rather than their
 *   balance.
 *
 * Kilo-exclusive models (e.g. `deepseek/deepseek-v4-pro:discounted`) are
 * always excluded from the BYOK bypass: they are Kilo-funded and platform
 * billed, so even when `getModelUserByokProviders` reports a provider that
 * can route the model, they must still go through the worker-side balance
 * check and cannot be legitimately served via a user's own BYOK key.
 *
 * Matches the same `isFree || hasUserByokAvailable` predicate the
 * NewSessionPanel model picker uses to filter `hasLimitedAccess` users, so
 * the picker and the router agree on which models bypass balance.
 */
export async function computeCloudAgentNextBalanceCheckEligibility(params: {
  fromDb: typeof db;
  user: Pick<User, 'id'>;
  modelId: string;
  organizationId?: string;
}): Promise<BalanceCheckModelEligibility> {
  const isFree = await isFreeModel(params.modelId);
  if (isFree) {
    return { isFree: true, hasUserByokAvailable: false };
  }

  if (isKiloExclusiveModel(params.modelId)) {
    return { isFree: false, hasUserByokAvailable: false };
  }

  const modelProviders = await getModelUserByokProviders(params.modelId);
  if (modelProviders.length === 0) {
    return { isFree: false, hasUserByokAvailable: false };
  }

  const enabledProviderIds = params.organizationId
    ? await getOrganizationByokProviderIds(params.fromDb, params.organizationId)
    : await getUserByokProviderIds(params.fromDb, params.user.id);

  const enabled = new Set(enabledProviderIds);
  const hasUserByokAvailable = modelProviders.some(provider => enabled.has(provider));
  return { isFree: false, hasUserByokAvailable };
}
