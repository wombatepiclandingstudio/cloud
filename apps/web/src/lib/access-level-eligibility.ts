export type AccessLevel = 'full' | 'limited' | 'blocked';

export type AccessLevelEligibility = {
  balance: number;
  minBalance: number;
  isEligible: boolean;
  accessLevel: AccessLevel;
};

export function buildAccessLevelEligibility(
  balance: number,
  minBalance: number
): AccessLevelEligibility {
  const accessLevel: AccessLevel = balance >= minBalance ? 'full' : 'limited';
  return {
    balance,
    minBalance,
    isEligible: accessLevel === 'full',
    accessLevel,
  };
}
