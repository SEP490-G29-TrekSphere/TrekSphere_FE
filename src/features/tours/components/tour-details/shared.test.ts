import type { TourDetailScheduleApi } from '@/features/tours/types';
import { getCheckpointImageUrls, isBookableSchedule, remainingSlots } from './shared';

function schedule(overrides: Partial<TourDetailScheduleApi> = {}): TourDetailScheduleApi {
  return {
    scheduleId: 'schedule-1',
    tourId: 'tour-1',
    departureDate: '2026-09-01',
    returnDate: '2026-09-03',
    availableSlots: 6,
    bookedSlots: 4,
    price: 1_000_000,
    status: 'OPEN',
    isDeleted: false,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    createdBy: 'vendor@example.com',
    updatedBy: 'vendor@example.com',
    deletedAt: null,
    deletedBy: null,
    ...overrides,
  };
}

describe('getCheckpointImageUrls', () => {
  test('ưu tiên danh sách ảnh đã được API tách sẵn', () => {
    expect(
      getCheckpointImageUrls({
        checkpointImageUrl: 'https://old.example/combined.jpg',
        checkpointImageUrls: [' https://cdn.example/one.jpg ', 'https://cdn.example/two.jpg'],
      })
    ).toEqual(['https://cdn.example/one.jpg', 'https://cdn.example/two.jpg']);
  });

  test('tách chuỗi ảnh cũ và loại bỏ URL trùng lặp', () => {
    expect(
      getCheckpointImageUrls({
        checkpointImageUrl:
          'https://cdn.example/one.jpg, https://cdn.example/two.jpg, https://cdn.example/one.jpg',
      })
    ).toEqual(['https://cdn.example/one.jpg', 'https://cdn.example/two.jpg']);
  });
});

describe('schedule availability', () => {
  test('dùng availableSlots trực tiếp vì BE đã trừ chỗ giữ và chỗ đã đặt', () => {
    expect(remainingSlots(schedule({ availableSlots: 6, bookedSlots: 4 }))).toBe(6);
  });

  test('chỉ cho đặt lịch OPEN còn chỗ', () => {
    expect(isBookableSchedule(schedule())).toBe(true);
    expect(isBookableSchedule(schedule({ availableSlots: 0 }))).toBe(false);
    expect(isBookableSchedule(schedule({ status: 'CLOSED' }))).toBe(false);
  });
});
