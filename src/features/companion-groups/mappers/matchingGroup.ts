import { MATCHING_GROUP_FALLBACK_COVER_IMAGE } from '../constants';
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

  leaderName: string;
  leaderAvatarUrl?: string;
  matchingDeadline?: string;
  coverImageUrl: string;
  estimatedCost?: number | null;
  isOwner?: boolean;
  myRole?: import('../types/matchingGroup').MatchingMemberRole | null;
}

export function isMatchingGroupItem(group: MatchingGroupCardData): group is MatchingGroupItem {
  return 'matchingGroupId' in group;
}

export function toMatchingGroupCardViewModel(
  group: MatchingGroupCardData,
  currentUserId?: string
): MatchingGroupCardViewModel {
  if (isMatchingGroupItem(group)) {
    const isLeaderRole =
      group.myRole === 'LEADER' ||
      (group as unknown as { role?: string }).role === 'LEADER' ||
      (group.isOwner === true && group.myRole !== 'MEMBER');

    const myRole =
      group.myRole ??
      (group as unknown as { role?: import('../types/matchingGroup').MatchingMemberRole }).role ??
      (isLeaderRole ? 'LEADER' : null);

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
      leaderName: group.leaderName ?? group.ownerName,
      leaderAvatarUrl: group.leaderAvatarUrl ?? group.ownerAvatarUrl ?? undefined,
      matchingDeadline: group.matchingDeadline,
      coverImageUrl:
        group.coverImageUrl || group.tourImageUrl || MATCHING_GROUP_FALLBACK_COVER_IMAGE,
      estimatedCost: group.estimatedCost ?? null,
      isOwner: isLeaderRole,
      myRole,
    };
  }

  const isOwner = Boolean(
    (currentUserId && String(group.leader.id) === String(currentUserId)) ||
      (group as unknown as { isOwner?: boolean }).isOwner === true ||
      (group as unknown as { myRole?: string }).myRole === 'LEADER'
  );

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
    leaderName: group.leader.name,
    leaderAvatarUrl: group.leader.avatarUrl,
    coverImageUrl: group.thumbnailUrl || MATCHING_GROUP_FALLBACK_COVER_IMAGE,
    isOwner,
    myRole: isOwner ? 'LEADER' : 'MEMBER',
  };
}

export function toMatchingGroupCreateRequest(
  values: CreateTourMatchingGroupFormValues
): MatchingGroupCreateRequest {
  const matchingDeadline = values.matchingDeadline.includes('T')
    ? `${values.matchingDeadline}:00`
    : `${values.matchingDeadline}T00:00:00`;

  const scheduledStartAt = `${values.targetDate}T08:00:00`;
  const coverImageUrl = values.coverImageUrl?.trim() || undefined;

  if (values.sourceType === 'TOUR' && values.tourId) {
    return {
      sourceType: 'TOUR',
      tourId: values.tourId,
      groupName: values.groupName,
      description: values.description || undefined,
      coverImageUrl,
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
    coverImageUrl,
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

export function resolveCurrentLeaderMember(group: {
  members?: import('../types/matchingGroup').MatchingMemberItem[];
}): import('../types/matchingGroup').MatchingMemberItem | null {
  return (
    group.members?.find((member) => member.role === 'LEADER' && member.status === 'ACCEPTED') ??
    null
  );
}

export function isCurrentUserGroupLeader(
  group: {
    members?: import('../types/matchingGroup').MatchingMemberItem[];
    myRole?: import('../types/matchingGroup').MatchingMemberRole | null;
    myMembershipStatus?: import('../types/matchingGroup').MatchingMemberStatus | null;
  },
  userId: string | undefined
): boolean {
  const leader = resolveCurrentLeaderMember(group);
  if (leader) return String(leader.userId) === String(userId);

  if (group.myMembershipStatus && group.myMembershipStatus !== 'ACCEPTED') {
    return false;
  }
  return group.myRole === 'LEADER';
}

export function resolveGroupUserRole(
  group: import('../types/matchingGroup').MatchingGroupDetailResponse | undefined,
  userId: string | undefined
): import('../types').UserRoleInGroup {
  if (!group || !userId) return 'guest';
  if (isCurrentUserGroupLeader(group, userId)) {
    return 'leader';
  }
  if (group.myMembershipStatus === 'ACCEPTED' && group.myRole === 'MEMBER') {
    return 'member';
  }
  if (group.myMembershipStatus === 'PENDING') {
    return 'pending';
  }
  const membership = group.members?.find((member) => String(member.userId) === String(userId));
  if (membership?.status === 'ACCEPTED') {
    return membership.role === 'LEADER' ? 'leader' : 'member';
  }
  if (membership?.status === 'PENDING') return 'pending';
  return 'guest';
}
