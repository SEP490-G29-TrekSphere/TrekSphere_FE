import { useQuery } from '@tanstack/react-query';
import { vendorTourService } from '../services/vendorTourService';

export const vendorTourStatsKeys = {
  all: ['vendor-tours', 'stats'] as const,
};

/**
 * `GET /vendor/tours` không hỗ trợ lọc `status` phía server (đã xác nhận qua
 * OpenAPI spec — params chỉ có keyword/page/size/sortBy/sortDir), nên không thể
 * gọi 3 lần với `status` khác nhau và đọc `total`. Thay vào đó tải 1 mẻ đủ lớn
 * rồi đếm theo `status` phía client — chấp nhận có thể thiếu chính xác nếu
 * vendor có nhiều hơn `SAMPLE_SIZE` tour.
 */
const SAMPLE_SIZE = 200;

/** 4 số liệu cho thẻ thống kê + tab lọc (tổng số / bản nháp / đã công khai / đã ẩn). */
export function useVendorTourStats() {
  return useQuery({
    queryKey: vendorTourStatsKeys.all,
    queryFn: async () => {
      const { tours, total } = await vendorTourService.listMyTours({}, 1, SAMPLE_SIZE);
      return {
        total,
        draft: tours.filter((tour) => tour.status === 'DRAFT').length,
        published: tours.filter((tour) => tour.status === 'PUBLISHED').length,
        hidden: tours.filter((tour) => tour.status === 'HIDDEN').length,
      };
    },
    staleTime: 0,
  });
}
