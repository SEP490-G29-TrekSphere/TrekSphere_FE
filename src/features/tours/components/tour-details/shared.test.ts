import type { TourDetailScheduleApi } from '@/features/tours/types';
import { getCheckpointImageUrls, isBookableSchedule, splitLines } from './shared';

function schedule(overrides: Partial<TourDetailScheduleApi> = {}): TourDetailScheduleApi {
  return {
    scheduleId: 'schedule-1',
    tourId: 'tour-1',
    departureDate: '2026-09-01',
    returnDate: '2026-09-03',
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
  test('chỉ cho đặt lịch có trạng thái OPEN', () => {
    expect(isBookableSchedule(schedule())).toBe(true);
    expect(isBookableSchedule(schedule({ status: 'CLOSED' }))).toBe(false);
    expect(isBookableSchedule(schedule({ status: 'CANCELLED' }))).toBe(false);
  });
});

describe('splitLines', () => {
  test('tách từng dòng gạch đầu dòng thành 1 phần tử riêng, bỏ marker và dòng trống', () => {
    expect(splitLines('- Xe đưa đón\n- Hướng dẫn viên\n\n- Bảo hiểm du lịch')).toEqual([
      'Xe đưa đón',
      'Hướng dẫn viên',
      'Bảo hiểm du lịch',
    ]);
  });

  test('vẫn hoạt động khi không có dấu gạch đầu dòng', () => {
    expect(splitLines('Dòng một\nDòng hai')).toEqual(['Dòng một', 'Dòng hai']);
  });

  test('trả về mảng rỗng khi input rỗng hoặc null/undefined', () => {
    expect(splitLines('')).toEqual([]);
    expect(splitLines(null)).toEqual([]);
    expect(splitLines(undefined)).toEqual([]);
  });

  test('không tách theo dấu phẩy trong 1 dòng (khác splitField)', () => {
    expect(splitLines('- Xe đưa đón, Hướng dẫn viên')).toEqual(['Xe đưa đón, Hướng dẫn viên']);
  });
});
