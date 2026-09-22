
export interface CancellationPolicy {
  cancellationPolicyId: string;

  cancelBeforeDays: number;

  refundPercentage: number;
  description?: string;
  isActive: boolean;
}

export interface CancellationPolicyPayload {
  cancelBeforeDays: number;
  refundPercentage: number;
  description?: string;
}

export function sortPoliciesByDaysDesc(policies: CancellationPolicy[]): CancellationPolicy[] {
  return [...policies].sort((a, b) => b.cancelBeforeDays - a.cancelBeforeDays);
}
