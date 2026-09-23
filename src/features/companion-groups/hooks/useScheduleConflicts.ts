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

export interface ScheduleRange {
  start?: string | null;
  end?: string | null;
}

function toDayKey(value?: string | null): string | null {
  if (!value) return null;
  const day = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

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
      kind: group.myRole === 'LEADER' ? 'LEADER' : 'MEMBER',
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

    isLoading: enabled && (myGroupsQuery.isLoading || myApplicationsQuery.isLoading),
    isEnabled: enabled,
  };
}
