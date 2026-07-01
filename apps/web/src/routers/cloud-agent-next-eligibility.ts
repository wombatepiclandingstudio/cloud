export const CLOUD_AGENT_NEXT_MIN_BALANCE_DOLLARS = 1;

export type CloudAgentNextAccessLevel = 'full' | 'limited' | 'blocked';

export type CloudAgentNextEligibility = {
  balance: number;
  minBalance: number;
  isEligible: boolean;
  accessLevel: CloudAgentNextAccessLevel;
};

export function buildCloudAgentNextEligibility(balance: number): CloudAgentNextEligibility {
  const accessLevel: CloudAgentNextAccessLevel =
    balance >= CLOUD_AGENT_NEXT_MIN_BALANCE_DOLLARS ? 'full' : 'limited';
  return {
    balance,
    minBalance: CLOUD_AGENT_NEXT_MIN_BALANCE_DOLLARS,
    isEligible: accessLevel === 'full',
    accessLevel,
  };
}
