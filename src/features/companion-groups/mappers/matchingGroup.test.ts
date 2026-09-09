import type { CompanionGroup } from '../types';
import type { MatchingGroupItem } from '../types/matchingGroup';
import { toMatchingGroupCardViewModel, toTourMatchingGroupCreateRequest } from './matchingGroup';

const apiGroup: MatchingGroupItem = {
  matchingGroupId: 'group-1',
  sourceType: 'CUSTOM_JOURNEY',
  tourId: null,
  tourName: null,
  customJourneyId: 'journey-1',
  customJourneyTitle: 'Cung đường Tà Năng',
  difficulty: 'MODERATE',
  location: 'Lâm Đồng',
  estimatedCost: 500_000,
  ownerId: 'owner-1',
  ownerName: 'Nguyễn An',
  ownerAvatarUrl: null,
  groupName: 'Nhóm Tà Năng',
  description: null,
  maxSize: 6,
  currentSize: 2,
  targetDate: '2026-10-20',
  matchingDeadline: '2026-10-19T18:00:00',
  status: 'OPEN',
  createdAt: '2026-09-09T08:00:00',
};

describe('toMatchingGroupCardViewModel', () => {
  test('ưu tiên tên custom journey khi group không gắn tour', () => {
    expect(toMatchingGroupCardViewModel(apiGroup)).toMatchObject({
      groupId: 'group-1',
      journeyId: 'journey-1',
      journeyName: 'Cung đường Tà Năng',
      status: 'OPEN',
    });
  });

  test('chuẩn hóa model legacy tại một boundary duy nhất', () => {
    const legacyGroup: CompanionGroup = {
      id: 'legacy-1',
      title: 'Nhóm cũ',
      thumbnailUrl: '',
      difficulty: 'Vừa',
      departureDate: '20/10/2026',
      location: 'Lào Cai',
      currentMembers: 2,
      maxMembers: 5,
      neededMembers: 3,
      leader: { id: 'owner-2', name: 'Minh', initials: 'M' },
    };
    expect(toMatchingGroupCardViewModel(legacyGroup)).toMatchObject({
      groupId: 'legacy-1',
      ownerId: 'owner-2',
      currentSize: 2,
      maxSize: 5,
    });
  });
});

describe('toTourMatchingGroupCreateRequest', () => {
  test('tạo payload TOUR canonical từ form values', () => {
    expect(
      toTourMatchingGroupCreateRequest({
        tourId: '11111111-1111-4111-8111-111111111111',
        groupName: 'Nhóm Fansipan',
        description: '',
        maxSize: 4,
        targetDate: '2026-10-20',
        matchingDeadline: '2026-10-19T18:00',
      })
    ).toEqual({
      sourceType: 'TOUR',
      tourId: '11111111-1111-4111-8111-111111111111',
      groupName: 'Nhóm Fansipan',
      description: '',
      maxSize: 4,
      targetDate: '2026-10-20',
      matchingDeadline: '2026-10-19T18:00:00',
      scheduledStartAt: '2026-10-20T08:00:00',
    });
  });
});
