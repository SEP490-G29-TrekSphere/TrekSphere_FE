import { createTourMatchingGroupSchema, joinGroupApplicationSchema } from './index';

const validCreateInput = {
  tourId: '11111111-1111-4111-8111-111111111111',
  groupName: 'Nhóm Fansipan tháng 10',
  description: 'Cùng chuẩn bị thể lực trước hành trình.',
  maxSize: '6',
  targetDate: '2026-10-20',
  matchingDeadline: '2026-10-19T18:00',
};

describe('createTourMatchingGroupSchema', () => {
  test('chuẩn hóa maxSize dạng chuỗi thành số', () => {
    const result = createTourMatchingGroupSchema.parse(validCreateInput);
    expect(result.maxSize).toBe(6);
  });

  test('từ chối deadline sau ngày khởi hành', () => {
    const result = createTourMatchingGroupSchema.safeParse({
      ...validCreateInput,
      matchingDeadline: '2026-10-21T08:00',
    });
    expect(result.success).toBe(false);
  });

  test('từ chối tên nhóm và sức chứa ngoài contract', () => {
    const result = createTourMatchingGroupSchema.safeParse({
      ...validCreateInput,
      groupName: 'ab',
      maxSize: 101,
    });
    expect(result.success).toBe(false);
  });
});

describe('joinGroupApplicationSchema', () => {
  test('cho phép lời nhắn trống theo contract API', () => {
    expect(joinGroupApplicationSchema.parse({ message: '' })).toEqual({ message: '' });
  });

  test('từ chối lời nhắn vượt quá 500 ký tự', () => {
    const result = joinGroupApplicationSchema.safeParse({ message: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });
});
