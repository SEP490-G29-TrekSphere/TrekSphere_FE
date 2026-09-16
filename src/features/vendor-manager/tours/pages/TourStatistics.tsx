import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getVendorTourPreviewPath } from '@/constants';
import { TourPagination } from '@/features/vendor-tours/components/TourPagination';
import { TourStatusBadge } from '@/features/vendor-tours/components/TourStatusBadge';
import { useVendorTourStatistics } from '@/features/vendor-tours/hooks/useVendorTourStatistics';
import type { ApiStatus } from '@/features/vendor-tours/types';
import { useDebounce } from '@/shared/hooks';
import { PortalFilterBar, PortalPageHeader } from '@/shared/ui';

const PAGE_SIZE = 10;

/** Tỷ lệ 0..1 từ BE → chuỗi phần trăm hiển thị, VD 0.6543 → "65%". */
function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('vi-VN');
}

const STATUS_TABS: Array<{ key: ApiStatus | ''; label: string }> = [
  { key: '', label: 'Tất cả' },
  { key: 'DRAFT', label: 'Bản nháp' },
  { key: 'PUBLISHED', label: 'Đã công khai' },
  { key: 'HIDDEN', label: 'Đã ẩn' },
];

/**
 * Thống kê Tour — KPI tổng quan + bảng thống kê theo từng tour của vendor hiện tại, lấy từ
 * `GET /vendors/profile/statistics` (khác hẳn 2 thẻ KPI đếm-thủ-công ở `TourList.tsx`, vốn chỉ
 * đếm số lượng theo trạng thái chứ không có số liệu về lịch/nhóm ghép/tỷ lệ lấp đầy).
 */
export default function TourStatistics() {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<ApiStatus | ''>('');
  const debouncedKeyword = useDebounce(keyword, 400);

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ cần trigger reset khi filter đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedKeyword, status]);

  const { data, isLoading, isError, error } = useVendorTourStatistics({
    keyword: debouncedKeyword || undefined,
    status: status || undefined,
    page: page - 1,
    size: PAGE_SIZE,
  });

  const overview = data?.overview;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Thống kê Tour"
        description="Tổng quan hiệu quả các tour bạn đang quản lý — lịch khởi hành, nhóm ghép và tỷ lệ lấp đầy."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-3xl p-5" style={{ backgroundColor: '#06261D' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#A9B8B2' }}>
            Tổng số tour
          </p>
          <p className="mt-1 text-2xl font-extrabold text-white">{overview?.totalTours ?? '—'}</p>
        </div>
        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Bản nháp
          </p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
            {overview?.draftTours ?? '—'}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Đã công khai
          </p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
            {overview?.publishedTours ?? '—'}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Đã ẩn
          </p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
            {overview?.hiddenTours ?? '—'}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Lịch sắp khởi hành
          </p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
            {overview?.futureOpenSchedules ?? '—'}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Nhóm ghép đã hình thành
          </p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
            {overview?.matchingGroupCount ?? '—'}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Tỷ lệ lấp đầy TB
          </p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
            {overview ? formatRate(overview.averageFillRate) : '—'}
          </p>
        </div>
        <div className="rounded-3xl bg-white p-5" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Tỷ lệ nhóm đầy
          </p>
          <p className="mt-1 text-2xl font-extrabold" style={{ color: '#06261D' }}>
            {overview ? formatRate(overview.fullGroupRate) : '—'}
          </p>
        </div>
      </div>

      <PortalFilterBar
        tabs={STATUS_TABS}
        activeTab={status}
        onTabChange={setStatus}
        searchPlaceholder="Lọc theo tên tour..."
        searchValue={keyword}
        onSearchChange={setKeyword}
        onSearchClear={() => setKeyword('')}
      />

      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                {[
                  'Tên tour',
                  'Trạng thái',
                  'Ngày tạo',
                  'Ngày công khai',
                  'Lịch (mở/đóng/huỷ)',
                  'Nhóm ghép',
                  'Tỷ lệ lấp đầy',
                  'Tỷ lệ nhóm đầy',
                ].map((col) => (
                  <th
                    key={col}
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                    style={{ color: '#06261D' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Đang tải thống kê...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải thống kê:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : !data || data.tours.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có tour nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                data.tours.map((item) => (
                  <tr
                    key={item.tourId}
                    className="border-b transition-colors last:border-b-0 hover:bg-[#FAF9F5]"
                    style={{ borderColor: '#E6E2D1' }}
                  >
                    <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
                      <Link
                        to={getVendorTourPreviewPath(item.tourId)}
                        className="font-semibold hover:underline"
                        style={{ color: '#06261D' }}
                      >
                        {item.tourName}
                      </Link>
                    </td>
                    <td className="px-6 py-4" style={{ verticalAlign: 'middle' }}>
                      <TourStatusBadge status={item.status} />
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ verticalAlign: 'middle', color: '#6F7B75' }}
                    >
                      {formatDate(item.createdAt)}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ verticalAlign: 'middle', color: '#6F7B75' }}
                    >
                      {formatDate(item.publishedAt)}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ verticalAlign: 'middle', color: '#6F7B75' }}
                    >
                      {item.openScheduleCount}/{item.closedScheduleCount}/
                      {item.cancelledScheduleCount}
                    </td>
                    <td
                      className="px-6 py-4 text-sm font-semibold"
                      style={{ verticalAlign: 'middle', color: '#06261D' }}
                    >
                      {item.matchingGroupCount}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ verticalAlign: 'middle', color: '#6F7B75' }}
                    >
                      {formatRate(item.averageFillRate)}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ verticalAlign: 'middle', color: '#6F7B75' }}
                    >
                      {formatRate(item.fullGroupRate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TourPagination
          currentPage={page}
          totalPages={Math.max(1, data?.totalPages ?? 1)}
          onPageChange={setPage}
          totalCount={data?.totalElements ?? 0}
          pageSize={PAGE_SIZE}
        />
      </div>
    </div>
  );
}
