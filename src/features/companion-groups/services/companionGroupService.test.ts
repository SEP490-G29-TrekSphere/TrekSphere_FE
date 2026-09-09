import { ApiService } from '@/config/apiClient';
import { companionGroupService } from './companionGroupService';

jest.mock('@/config/apiClient', () => ({
  ApiService: jest.fn(),
}));

const mockApiService = ApiService as jest.MockedFunction<typeof ApiService>;

const groupDetail = {
  matchingGroupId: 'group-1',
};

const member = {
  applicationId: 'application-1',
};

describe('companionGroupService — contract Matching Group Phase 1-3', () => {
  beforeEach(() => {
    mockApiService.mockReset();
  });

  test('gửi đầy đủ filter discovery bằng GET /matching-groups', async () => {
    mockApiService.mockResolvedValueOnce({
      data: {
        content: [],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    });

    await companionGroupService.getMatchingGroups({
      sourceType: 'CUSTOM_JOURNEY',
      difficulty: 'HARD',
      location: 'Lào Cai',
      minCost: 500000,
      maxCost: 2000000,
      availableSlotsOnly: false,
      keyword: '  săn mây  ',
      page: 1,
    });

    expect(mockApiService).toHaveBeenCalledWith('/matching-groups', 'GET', undefined, {
      sourceType: 'CUSTOM_JOURNEY',
      difficulty: 'HARD',
      location: 'Lào Cai',
      minCost: '500000',
      maxCost: '2000000',
      availableSlotsOnly: 'false',
      keyword: 'săn mây',
      page: '1',
    });
  });

  test('lấy nhóm của tôi bằng endpoint mới và role LEADER', async () => {
    mockApiService.mockResolvedValueOnce({
      data: {
        content: [],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    });

    await companionGroupService.getMyMatchingGroups({ role: 'LEADER', status: 'OPEN' });

    expect(mockApiService).toHaveBeenCalledWith('/matching-groups/my-groups', 'GET', undefined, {
      role: 'LEADER',
      status: 'OPEN',
    });
  });

  test('tạo Group Tour-backed với sourceType và scheduledStartAt', async () => {
    mockApiService.mockResolvedValueOnce({ data: groupDetail });
    const payload = {
      sourceType: 'TOUR' as const,
      tourId: '32cf75df-3a80-4d96-83df-6926f86ee16e',
      groupName: 'Nhóm săn mây',
      maxSize: 6,
      targetDate: '2026-10-18',
      matchingDeadline: '2026-10-15T18:00:00',
      scheduledStartAt: '2026-10-18T08:00:00',
    };

    await companionGroupService.createMatchingGroup(payload);

    expect(mockApiService).toHaveBeenCalledWith('/matching-groups', 'POST', payload);
  });

  test('tạo Group Custom Journey không gửi tourId', async () => {
    mockApiService.mockResolvedValueOnce({ data: groupDetail });
    const payload = {
      sourceType: 'CUSTOM_JOURNEY' as const,
      groupName: 'Nhóm Tà Năng',
      maxSize: 5,
      targetDate: '2026-11-02',
      matchingDeadline: '2026-10-28T18:00:00',
      scheduledStartAt: '2026-11-02T06:00:00',
      customJourney: {
        title: 'Tà Năng - Phan Dũng',
        difficulty: 'HARD' as const,
        startDate: '2026-11-02',
        endDate: '2026-11-04',
      },
    };

    await companionGroupService.createMatchingGroup(payload);

    expect(mockApiService).toHaveBeenCalledWith('/matching-groups', 'POST', payload);
    expect(payload).not.toHaveProperty('tourId');
  });

  test('cập nhật Group bằng PATCH', async () => {
    mockApiService.mockResolvedValueOnce({ data: groupDetail });

    await companionGroupService.updateMatchingGroup('group-1', { maxSize: 8 });

    expect(mockApiService).toHaveBeenCalledWith('/matching-groups/group-1', 'PATCH', {
      maxSize: 8,
    });
  });

  test.each([
    'hide',
    'show',
    'close',
    'open',
  ] as const)('gọi lifecycle action %s bằng POST', async (action) => {
    mockApiService.mockResolvedValueOnce({ data: groupDetail });

    await companionGroupService[
      `${action}MatchingGroup` as
        | 'hideMatchingGroup'
        | 'showMatchingGroup'
        | 'closeMatchingGroup'
        | 'openMatchingGroup'
    ]('group-1');

    expect(mockApiService).toHaveBeenCalledWith(`/matching-groups/group-1/${action}`, 'POST');
  });

  test('submit application gửi message qua endpoint /applications', async () => {
    mockApiService.mockResolvedValueOnce({ data: member });

    await companionGroupService.submitApplication('group-1', { message: 'Mình muốn tham gia.' });

    expect(mockApiService).toHaveBeenCalledWith('/matching-groups/group-1/applications', 'POST', {
      message: 'Mình muốn tham gia.',
    });
  });

  test('withdraw application dùng POST action, không dùng DELETE legacy', async () => {
    mockApiService.mockResolvedValueOnce({ data: member });

    await companionGroupService.withdrawApplication('group-1');

    expect(mockApiService).toHaveBeenCalledWith(
      '/matching-groups/group-1/applications/me/withdraw',
      'POST'
    );
  });

  test('Leader approve/reject theo applicationId bằng POST', async () => {
    mockApiService.mockResolvedValue({ data: member });

    await companionGroupService.approveApplication('group-1', 'application-1');
    await companionGroupService.rejectApplication('group-1', 'application-2');

    expect(mockApiService).toHaveBeenNthCalledWith(
      1,
      '/matching-groups/group-1/applications/application-1/approve',
      'POST'
    );
    expect(mockApiService).toHaveBeenNthCalledWith(
      2,
      '/matching-groups/group-1/applications/application-2/reject',
      'POST'
    );
  });

  test('lấy application của Leader và của chính User qua endpoint mới', async () => {
    mockApiService.mockResolvedValue({
      data: {
        content: [],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: true,
      },
    });

    await companionGroupService.getJoinRequests('group-1', { status: 'PENDING' });
    await companionGroupService.getMyJoinRequests({ status: 'WITHDRAWN' });

    expect(mockApiService).toHaveBeenNthCalledWith(
      1,
      '/matching-groups/group-1/applications',
      'GET',
      undefined,
      { status: 'PENDING' }
    );
    expect(mockApiService).toHaveBeenNthCalledWith(
      2,
      '/matching-groups/my-applications',
      'GET',
      undefined,
      { status: 'WITHDRAWN' }
    );
  });

  test('ném message BE và không biến lỗi xác thực thành danh sách rỗng', async () => {
    mockApiService.mockResolvedValueOnce({ error: 'Bạn cần đăng nhập.', status: 401 });

    await expect(companionGroupService.getMatchingGroups()).rejects.toThrow('Bạn cần đăng nhập.');
  });
});
