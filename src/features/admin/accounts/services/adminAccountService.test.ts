import { ApiService } from '@/config/apiClient';
import { adminAccountService } from './adminAccountService';

jest.mock('@/config/apiClient', () => ({
  ApiService: jest.fn(),
}));

const mockApiService = ApiService as jest.MockedFunction<typeof ApiService>;

describe('adminAccountService.updateStatus', () => {
  beforeEach(() => {
    mockApiService.mockReset();
  });

  test('khóa gửi status LOCKED qua query param của PUT /users/{id}/status', async () => {
    mockApiService.mockResolvedValueOnce({ status: 200 });

    await adminAccountService.updateStatus('u1', 'LOCKED');

    expect(mockApiService).toHaveBeenCalledWith('/users/u1/status', 'PUT', undefined, {
      status: 'LOCKED',
    });
  });

  test('mở khóa gửi status ACTIVE', async () => {
    mockApiService.mockResolvedValueOnce({ status: 200 });

    await adminAccountService.updateStatus('u1', 'ACTIVE');

    expect(mockApiService).toHaveBeenCalledWith('/users/u1/status', 'PUT', undefined, {
      status: 'ACTIVE',
    });
  });

  test('ném Error kèm message của BE khi request thất bại', async () => {
    mockApiService.mockResolvedValueOnce({
      error: 'Không có quyền thực hiện hành động này',
      status: 403,
    });

    await expect(adminAccountService.updateStatus('u1', 'LOCKED')).rejects.toThrow(
      'Không có quyền thực hiện hành động này'
    );
  });
});
