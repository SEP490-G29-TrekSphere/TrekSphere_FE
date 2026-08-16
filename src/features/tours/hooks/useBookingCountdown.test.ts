import { secondsUntil } from './useBookingCountdown';

describe('secondsUntil', () => {
  const now = Date.parse('2026-08-16T10:00:00Z');

  test('tính thời gian còn lại từ deadline tuyệt đối của BE', () => {
    expect(secondsUntil('2026-08-16T10:15:00Z', now)).toBe(900);
  });

  test('không trả số âm khi deadline đã qua', () => {
    expect(secondsUntil('2026-08-16T09:59:59Z', now)).toBe(0);
  });

  test('trả 0 khi deadline thiếu hoặc không hợp lệ', () => {
    expect(secondsUntil(undefined, now)).toBe(0);
    expect(secondsUntil('not-a-date', now)).toBe(0);
  });
});
