import type { CheckpointDraft } from './CheckpointFields';
import { findDuplicateCheckpointError } from './TourForm';

function draft(overrides: Partial<CheckpointDraft> = {}): CheckpointDraft {
  return {
    key: Math.random().toString(36),
    name: 'Trạm nghỉ',
    description: '',
    latitude: '',
    longitude: '',
    altitude: '',
    imageUrls: [],
    ...overrides,
  };
}

describe('findDuplicateCheckpointError', () => {
  test('danh sách hợp lệ (khác tên, khác toạ độ) → không có lỗi', () => {
    const result = findDuplicateCheckpointError([
      draft({ name: 'Trạm 1', latitude: '21.5', longitude: '103.8' }),
      draft({ name: 'Trạm 2', latitude: '21.6', longitude: '103.9' }),
    ]);

    expect(result).toBeNull();
  });

  test('trùng tên → báo lỗi kèm số thứ tự trạm bị trùng', () => {
    const result = findDuplicateCheckpointError([
      draft({ name: 'Trạm nghỉ 2000m' }),
      draft({ name: 'Trạm nghỉ 2000m' }),
    ]);

    expect(result).toContain('Checkpoint #2');
    expect(result).toContain('Trạm nghỉ 2000m');
  });

  test('trùng tên không phân biệt hoa thường và khoảng trắng thừa', () => {
    const result = findDuplicateCheckpointError([
      draft({ name: 'Trạm Nghỉ' }),
      draft({ name: '  trạm nghỉ  ' }),
    ]);

    expect(result).not.toBeNull();
  });

  test('trùng toạ độ dù khác tên → báo lỗi', () => {
    const result = findDuplicateCheckpointError([
      draft({ name: 'Trạm 1', latitude: '21.5', longitude: '103.8' }),
      draft({ name: 'Trạm 2', latitude: '21.5', longitude: '103.8' }),
    ]);

    expect(result).toContain('Checkpoint #2');
    expect(result).toContain('toạ độ');
  });

  test('toạ độ ghi khác định dạng nhưng cùng giá trị vẫn tính là trùng', () => {
    const result = findDuplicateCheckpointError([
      draft({ name: 'Trạm 1', latitude: '21.50', longitude: '103.80' }),
      draft({ name: 'Trạm 2', latitude: '21.5', longitude: '103.8' }),
    ]);

    expect(result).not.toBeNull();
  });

  test('bỏ trống toạ độ ở nhiều trạm → không coi là trùng', () => {
    const result = findDuplicateCheckpointError([
      draft({ name: 'Trạm 1' }),
      draft({ name: 'Trạm 2' }),
      draft({ name: 'Trạm 3' }),
    ]);

    expect(result).toBeNull();
  });

  test('chỉ nhập vĩ độ, bỏ trống kinh độ → không coi là trùng', () => {
    const result = findDuplicateCheckpointError([
      draft({ name: 'Trạm 1', latitude: '21.5' }),
      draft({ name: 'Trạm 2', latitude: '21.5' }),
    ]);

    expect(result).toBeNull();
  });
});
