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
  isOwner?: boolean;
  myRole?: import('../types/matchingGroup').MatchingMemberRole | null;
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
      isOwner: group.isOwner ?? false,
      myRole: group.myRole ?? null,
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

export function toMatchingGroupCreateRequest(
  values: CreateTourMatchingGroupFormValues
): MatchingGroupCreateRequest {
  const matchingDeadline = values.matchingDeadline.includes('T')
    ? `${values.matchingDeadline}:00`
    : `${values.matchingDeadline}T00:00:00`;

  const scheduledStartAt = `${values.targetDate}T08:00:00`;

  if (values.sourceType === 'TOUR' && values.tourId) {
    return {
      sourceType: 'TOUR',
      tourId: values.tourId,
      groupName: values.groupName,
      description: values.description || undefined,
      maxSize: values.maxSize,
      targetDate: values.targetDate,
      matchingDeadline,
      scheduledStartAt,
    };
  }

  return {
    sourceType: 'CUSTOM_JOURNEY',
    groupName: values.groupName,
    description: values.description || undefined,
    maxSize: values.maxSize,
    targetDate: values.targetDate,
    matchingDeadline,
    scheduledStartAt,
    customJourney: {
      title: values.groupName,
      description: values.description || undefined,
      difficulty: values.difficulty,
      startDate: values.targetDate,
      endDate: values.endDate || values.targetDate,
    },
  };
}

export const toTourMatchingGroupCreateRequest = toMatchingGroupCreateRequest;

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
