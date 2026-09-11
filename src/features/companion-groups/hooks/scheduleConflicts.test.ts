import type { MatchingGroupItem, MyMatchingJoinRequestItem } from '../types/matchingGroup';
import { collectScheduleConflicts } from './useScheduleConflicts';

function makeGroup(overrides: Partial<MatchingGroupItem>): MatchingGroupItem {
  return {
    matchingGroupId: 'g1',
    sourceType: 'CUSTOM_JOURNEY',
    tourId: null,
    tourName: null,
    customJourneyId: 'cj1',
    customJourneyTitle: 'Lảo Thẩn săn mây',
    difficulty: 'MODERATE',
    location: 'Lào Cai',
    estimatedCost: null,
    ownerId: 'me',
    ownerName: 'Minh Tuấn',
    ownerAvatarUrl: null,
    groupName: 'Nhóm Lảo Thẩn',
    description: null,
    maxSize: 5,
    currentSize: 2,
    targetDate: '2026-09-15',
    matchingDeadline: '2026-09-14T18:00:00',
    status: 'OPEN',
    createdAt: '2026-09-01T08:00:00',
    ...overrides,
  };
}

function makeApplication(overrides: Partial<MyMatchingJoinRequestItem>): MyMatchingJoinRequestItem {
  return {
    applicationId: 'a1',
    matchingMemberId: 'm1',
    matchingGroupId: 'g2',
    groupName: 'Nhóm Tà Xùa',
    groupStatus: 'OPEN',
    sourceType: 'TOUR',
    tourId: 't1',
    tourName: 'Tà Xùa 2N1Đ',
    customJourneyId: null,
    customJourneyTitle: null,
    difficulty: 'HARD',
    location: 'Sơn La',
    ownerId: 'someone',
    ownerName: 'Long Minh',
    ownerAvatarUrl: null,
    currentSize: 3,
    maxSize: 6,
    targetDate: '2026-09-15',
    matchingDeadline: '2026-09-13T18:00:00',
    message: null,
    rejectReason: null,
    status: 'PENDING',
    createdAt: '2026-09-02T08:00:00',
    reviewedAt: null,
    updatedAt: '2026-09-02T08:00:00',
    withdrawnAt: null,
    canCancel: true,
    canWithdraw: true,
    ...overrides,
  };
}

describe('collectScheduleConflicts', () => {
  it('báo trùng khi nhóm đang tham gia rơi đúng ngày khởi hành', () => {
    const conflicts = collectScheduleConflicts([makeGroup({})], [], { start: '2026-09-15' });

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].groupName).toBe('Nhóm Lảo Thẩn');
    expect(conflicts[0].kind).toBe('MEMBER');
  });

  it('đánh dấu vai trò trưởng nhóm để người dùng biết phải xử lý nhóm nào', () => {
    const conflicts = collectScheduleConflicts([makeGroup({ myRole: 'LEADER' })], [], {
      start: '2026-09-15',
    });

    expect(conflicts[0].kind).toBe('LEADER');
  });

  it('tính cả đơn xin tham gia đang chờ duyệt', () => {
    const conflicts = collectScheduleConflicts([], [makeApplication({})], {
      start: '2026-09-15',
    });

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].kind).toBe('PENDING_APPLICATION');
  });

  it('bắt cả trường hợp ngày cũ nằm giữa khoảng của chuyến nhiều ngày', () => {
    const conflicts = collectScheduleConflicts([makeGroup({})], [], {
      start: '2026-09-14',
      end: '2026-09-16',
    });

    expect(conflicts).toHaveLength(1);
  });

  it('không báo trùng khi ngày nằm ngoài khoảng', () => {
    expect(collectScheduleConflicts([makeGroup({})], [], { start: '2026-09-20' })).toHaveLength(0);
  });

  it('bỏ qua nhóm đã hoàn thành hoặc đã huỷ', () => {
    const finished = collectScheduleConflicts([makeGroup({ status: 'COMPLETED' })], [], {
      start: '2026-09-15',
    });
    const cancelled = collectScheduleConflicts([makeGroup({ status: 'CANCELLED' })], [], {
      start: '2026-09-15',
    });

    expect(finished).toHaveLength(0);
    expect(cancelled).toHaveLength(0);
  });

  it('bỏ qua chính nhóm đang thao tác', () => {
    const conflicts = collectScheduleConflicts([makeGroup({})], [], { start: '2026-09-15' }, 'g1');

    expect(conflicts).toHaveLength(0);
  });

  it('không kết luận gì khi chưa chọn ngày', () => {
    expect(collectScheduleConflicts([makeGroup({})], [], { start: '' })).toHaveLength(0);
  });

  it('so sánh theo ngày kể cả khi API trả kèm giờ', () => {
    const conflicts = collectScheduleConflicts(
      [makeGroup({ targetDate: '2026-09-15T08:00:00' })],
      [],
      { start: '2026-09-15' }
    );

    expect(conflicts).toHaveLength(1);
  });
});
