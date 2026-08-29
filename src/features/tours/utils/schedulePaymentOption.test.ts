import type { TourPaymentPolicy } from '@/features/payments/types';
import {
  effectiveSchedulePaymentOption,
  isDepositAvailableForSchedule,
  isDepositDeadlinePassed,
} from './schedulePaymentOption';

const policy: TourPaymentPolicy = {
  tourId: 'tour-1',
  paymentOption: 'DEPOSIT_ONLY',
  depositType: 'PERCENTAGE',
  depositValue: 50,
  remainingDueDaysBeforeDeparture: 2,
  policyVersion: 1,
};
const now = new Date(2026, 7, 15, 12);

describe('effective schedule payment option', () => {
  test('keeps deposit available while the remaining-payment deadline is still ahead', () => {
    const schedule = { departureDate: '2026-08-18' };

    expect(isDepositAvailableForSchedule(policy, schedule, now)).toBe(true);
    expect(effectiveSchedulePaymentOption(policy, schedule, now)).toBe('DEPOSIT_ONLY');
    expect(isDepositDeadlinePassed(policy, schedule, now)).toBe(false);
  });

  test('forces full payment when the schedule has reached the deposit deadline', () => {
    const schedule = { departureDate: '2026-08-16' };

    expect(isDepositAvailableForSchedule(policy, schedule, now)).toBe(false);
    expect(effectiveSchedulePaymentOption(policy, schedule, now)).toBe('FULL_PAYMENT_ONLY');
    expect(isDepositDeadlinePassed(policy, schedule, now)).toBe(true);
  });
});
