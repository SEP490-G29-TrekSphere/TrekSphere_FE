import { ApiService } from '@/config/apiClient';
import { vendorTourService } from './vendorTourService';

jest.mock('@/config/apiClient', () => ({
  ApiService: jest.fn(),
  ApiUpload: jest.fn(),
}));

const mockApiService = ApiService as jest.MockedFunction<typeof ApiService>;

describe('vendorTourService — publish/unpublish tour', () => {
  beforeEach(() => {
    mockApiService.mockReset();
  });

  test('publishTour gọi PUT /vendor/tours/{id}/publish không kèm body', async () => {
    mockApiService.mockResolvedValueOnce({ data: { tourId: 't1', status: 'PUBLISHED' } });

    const result = await vendorTourService.publishTour('t1');

    expect(mockApiService).toHaveBeenCalledWith('/vendor/tours/t1/publish', 'PUT');
    expect(result).toEqual({ id: 't1', status: 'PUBLISHED' });
  });

  test('unpublishTour gọi PUT /vendor/tours/{id}/unpublish không kèm body', async () => {
    mockApiService.mockResolvedValueOnce({ data: { tourId: 't1', status: 'DRAFT' } });

    const result = await vendorTourService.unpublishTour('t1');

    expect(mockApiService).toHaveBeenCalledWith('/vendor/tours/t1/unpublish', 'PUT');
    expect(result).toEqual({ id: 't1', status: 'DRAFT' });
  });

  test('listMyTours trả về createdAt cho từng tour', async () => {
    mockApiService.mockResolvedValueOnce({
      data: {
        content: [
          {
            tourId: 't1',
            tourName: 'Đỉnh Phượng Hoàng',
            basePrice: 15000000,
            difficulty: 'MODERATE',
            status: 'DRAFT',
            coverImageUrl: null,
            createdAt: '2026-07-20T10:00:00Z',
          },
        ],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 1,
        totalPages: 1,
        last: true,
      },
    });

    const result = await vendorTourService.listMyTours({}, 1, 10);

    expect(result.tours[0].createdAt).toBe('2026-07-20T10:00:00Z');
  });
});
