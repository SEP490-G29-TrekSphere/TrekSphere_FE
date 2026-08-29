import type { PaymentOption, TourPaymentPolicy } from '@/features/payments/types';

interface ScheduleWithDepartureDate {
  departureDate: string;
}

function localDate(value: string): Date | null {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function isDepositAvailableForSchedule(
  policy?: TourPaymentPolicy,
  schedule?: ScheduleWithDepartureDate,
  now = new Date()
): boolean {
  if (
    !policy ||
    policy.paymentOption === 'FULL_PAYMENT_ONLY' ||
    policy.depositType == null ||
    policy.depositValue == null ||
    policy.remainingDueDaysBeforeDeparture == null ||
    !schedule
  ) {
    return false;
  }

  const departureDate = localDate(schedule.departureDate);
  if (!departureDate) return false;
  const depositDueDate = new Date(departureDate);
  depositDueDate.setDate(depositDueDate.getDate() - policy.remainingDueDaysBeforeDeparture);
  return depositDueDate.getTime() > startOfLocalDay(now).getTime();
}

export function effectiveSchedulePaymentOption(
  policy?: TourPaymentPolicy,
  schedule?: ScheduleWithDepartureDate,
  now = new Date()
): PaymentOption {
  if (!policy) return 'FULL_PAYMENT_ONLY';
  if (policy.paymentOption === 'FULL_PAYMENT_ONLY' || !schedule) return policy.paymentOption;
  return isDepositAvailableForSchedule(policy, schedule, now)
    ? policy.paymentOption
    : 'FULL_PAYMENT_ONLY';
}

export function isDepositDeadlinePassed(
  policy?: TourPaymentPolicy,
  schedule?: ScheduleWithDepartureDate,
  now = new Date()
): boolean {
  return Boolean(
    policy &&
      schedule &&
      policy.paymentOption !== 'FULL_PAYMENT_ONLY' &&
      policy.depositType != null &&
      policy.depositValue != null &&
      policy.remainingDueDaysBeforeDeparture != null &&
      !isDepositAvailableForSchedule(policy, schedule, now)
  );
}
