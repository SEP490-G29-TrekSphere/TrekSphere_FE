import type { CompanionGroup } from '../types';
import type { MatchingGroupCreateRequest, MatchingGroupItem } from '../types/matchingGroup';
import type { CreateTourMatchingGroupFormValues } from '../validations';

export type MatchingGroupCardData = CompanionGroup | MatchingGroupItem;

export interface MatchingGroupCardViewModel {
  groupId: string;
  ownerId: string;
  groupName: string;
  journeyName: string | null;
  journeyId: string | null;
  status: MatchingGroupItem['status'];
  targetDate: string;
  currentSize: number;
  maxSize: number;
  ownerName: string;
  ownerAvatarUrl?: string;
  matchingDeadline?: string;
  coverImageUrl?: string;
}

export function isMatchingGroupItem(group: MatchingGroupCardData): group is MatchingGroupItem {
  return 'matchingGroupId' in group;
}

export function toMatchingGroupCardViewModel(
  group: MatchingGroupCardData
): MatchingGroupCardViewModel {
  if (isMatchingGroupItem(group)) {
    return {
      groupId: group.matchingGroupId,
      ownerId: group.ownerId,
      groupName: group.groupName,
      journeyName: group.tourName ?? group.customJourneyTitle ?? group.location,
      journeyId: group.tourId ?? group.customJourneyId,
      status: group.status,
      targetDate: group.targetDate,
      currentSize: group.currentSize,
      maxSize: group.maxSize,
      ownerName: group.ownerName,
      ownerAvatarUrl: group.ownerAvatarUrl ?? undefined,
      matchingDeadline: group.matchingDeadline,
      coverImageUrl: group.tourImageUrl ?? undefined,
    };
  }

  return {
    groupId: group.id,
    ownerId: group.leader.id,
    groupName: group.title,
    journeyName: group.location,
    journeyId: group.id,
    status: 'OPEN',
    targetDate: group.departureDate,
    currentSize: group.currentMembers,
    maxSize: group.maxMembers,
    ownerName: group.leader.name,
    ownerAvatarUrl: group.leader.avatarUrl,
    coverImageUrl: group.thumbnailUrl,
  };
}

export function toTourMatchingGroupCreateRequest(
  values: CreateTourMatchingGroupFormValues
): MatchingGroupCreateRequest {
  const matchingDeadline = values.matchingDeadline.includes('T')
    ? `${values.matchingDeadline}:00`
    : `${values.matchingDeadline}T00:00:00`;

  return {
    sourceType: 'TOUR',
    tourId: values.tourId,
    groupName: values.groupName,
    description: values.description,
    maxSize: values.maxSize,
    targetDate: values.targetDate,
    matchingDeadline,
    scheduledStartAt: `${values.targetDate}T08:00:00`,
  };
}

export function resolveGroupUserRole(
  group: import('../types/matchingGroup').MatchingGroupDetailResponse | undefined,
  userId: string | undefined
): import('../types').UserRoleInGroup {
  if (!group || !userId) return 'guest';
  if (String(group.ownerId) === String(userId)) return 'leader';
  const membership = group.members.find((member) => String(member.userId) === String(userId));
  if (membership?.status === 'ACCEPTED') return 'member';
  if (membership?.status === 'PENDING') return 'pending';
  return 'guest';
}
