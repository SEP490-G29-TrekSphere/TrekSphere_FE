import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MATCHING_GROUP_BUSY_STATUSES, MATCHING_GROUP_LOOKUP_PAGE_SIZE } from '../constants';
import type {
  MatchingGroupItem,
  MyMatchingJoinRequestItem,
  ScheduleConflict,
} from '../types/matchingGroup';
import { useMyJoinRequests } from './useMyJoinRequests';
import { useMyMatchingGroups } from './useMyMatchingGroups';

/** Khoảng ngày của chuyến định đăng ký; `end` bỏ trống nghĩa là đi trong ngày. */
export interface ScheduleRange {
  start?: string | null;
  end?: string | null;
}

/** Cắt phần giờ để so sánh theo ngày (`yyyy-MM-dd` so sánh chuỗi là đủ). */
function toDayKey(value?: string | null): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

/**
 * Lọc ra các nhóm đang chiếm ngày trong khoảng `range`.
 *
 * Mỗi cam kết cũ chỉ biết đúng một ngày đi (`targetDate`) vì API danh sách không
 * trả ngày kết thúc, nên quy tắc là: ngày đó rơi vào khoảng của chuyến mới thì
 * tính là trùng. Tách riêng khỏi hook để test được mà không cần dựng React.
 */
export function collectScheduleConflicts(
  groups: MatchingGroupItem[],
  applications: MyMatchingJoinRequestItem[],
  range: ScheduleRange,
  excludeGroupId?: string
): ScheduleConflict[] {
  const start = toDayKey(range.start);
  if (!start) return [];
  const end = toDayKey(range.end) ?? start;
  const [from, to] = start <= end ? [start, end] : [end, start];

  const busy: ScheduleConflict[] = [];

  for (const group of groups) {
    if (!MATCHING_GROUP_BUSY_STATUSES.includes(group.status)) continue;
    busy.push({
      matchingGroupId: group.matchingGroupId,
      groupName: group.groupName,
      targetDate: group.targetDate,
      kind: group.myRole === 'LEADER' || group.isOwner ? 'LEADER' : 'MEMBER',
    });
  }

  for (const application of applications) {
    if (!MATCHING_GROUP_BUSY_STATUSES.includes(application.groupStatus)) continue;
    busy.push({
      matchingGroupId: application.matchingGroupId,
      groupName: application.groupName,
      targetDate: application.targetDate,
      kind: 'PENDING_APPLICATION',
    });
  }

  const seen = new Set<string>();
  return busy.filter((item) => {
    if (excludeGroupId && item.matchingGroupId === excludeGroupId) return false;
    const day = toDayKey(item.targetDate);
    if (!day || day < from || day > to) return false;
    const dedupeKey = `${item.matchingGroupId}-${item.kind}`;
    if (seen.has(dedupeKey)) return false;
    seen.add(dedupeKey);
    return true;
  });
}

/**
 * Các ngày đi mà người dùng hiện tại đã cam kết: nhóm đang làm trưởng, nhóm đang
 * tham gia và đơn xin tham gia còn chờ duyệt.
 *
 * Dùng để chặn đăng ký hai chuyến trùng ngày — BE chưa kiểm tra ràng buộc này.
 * Chỉ gọi API khi đã đăng nhập: các endpoint `my-*` trả 401 cho khách, và 401 sẽ
 * kích hoạt luồng refresh token rồi có thể đá người đang xem ra ngoài.
 */
export function useScheduleConflicts() {
  const user = useAppStore((state) => state.user);
  const enabled = Boolean(user?.id);

  const myGroupsQuery = useMyMatchingGroups(
    { page: 0, size: MATCHING_GROUP_LOOKUP_PAGE_SIZE },
    { enabled }
  );
  const myApplicationsQuery = useMyJoinRequests(
    { status: 'PENDING', page: 0, size: MATCHING_GROUP_LOOKUP_PAGE_SIZE },
    { enabled }
  );

  const groups = myGroupsQuery.data?.content;
  const applications = myApplicationsQuery.data?.content;

  const findConflicts = useCallback(
    (range: ScheduleRange, excludeGroupId?: string): ScheduleConflict[] =>
      collectScheduleConflicts(groups ?? [], applications ?? [], range, excludeGroupId),
    [groups, applications]
  );

  return {
    findConflicts,
    /** Chưa biết lịch cũ thì không thể kết luận là trùng hay không. */
    isLoading: enabled && (myGroupsQuery.isLoading || myApplicationsQuery.isLoading),
    isEnabled: enabled,
  };
}
