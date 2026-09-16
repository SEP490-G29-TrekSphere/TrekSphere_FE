import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getVendorManagerTourEditPath,
  getVendorManagerTourSchedulesPath,
  getVendorTourPreviewPath,
  PATHS,
} from '@/constants';
import { DeleteTourConfirmDialog } from '@/features/vendor-tours/components/DeleteTourConfirmDialog';
import { PublishTourConfirmDialog } from '@/features/vendor-tours/components/PublishTourConfirmDialog';
import { TourPagination } from '@/features/vendor-tours/components/TourPagination';
import {
  MANAGER_EDITABLE_STATUSES,
  TourTableRow,
} from '@/features/vendor-tours/components/TourTableRow';
import { UnpublishTourConfirmDialog } from '@/features/vendor-tours/components/UnpublishTourConfirmDialog';
import { useVendorTourList } from '@/features/vendor-tours/hooks/useVendorTourList';
import { useVendorTourMutations } from '@/features/vendor-tours/hooks/useVendorTourMutations';
import { useVendorTourStats } from '@/features/vendor-tours/hooks/useVendorTourStats';
import type { ApiDifficulty, ApiStatus, VendorTourListItem } from '@/features/vendor-tours/types';
import { useDebounce } from '@/shared/hooks';
import { AppButton, PortalFilterBar, PortalFilterSelect, PortalPageHeader } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

const PAGE_SIZE = 10;
/**
 * `GET /vendor/tours` không hỗ trợ lọc theo difficulty/status phía server
 * (đã xác nhận qua Swagger). Khi 1 trong 2 filter này đang active, chuyển
 * sang tải 1 mẻ lớn rồi lọc + phân trang phía client.
 */
const CLIENT_FILTER_SAMPLE_SIZE = 200;

const DIFFICULTY_OPTIONS: Array<{ value: ApiDifficulty | ''; label: string }> = [
  { value: '', label: 'Tất cả độ khó' },
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Trung bình' },
  { value: 'HARD', label: 'Khó' },
];

export default function TourList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState('');
  const [difficulty, setDifficulty] = useState<ApiDifficulty | ''>('');
  const [status, setStatus] = useState<ApiStatus | ''>('');
  const [deleteTarget, setDeleteTarget] = useState<VendorTourListItem | null>(null);
  const [publishTarget, setPublishTarget] = useState<VendorTourListItem | null>(null);
  const [unpublishTarget, setUnpublishTarget] = useState<VendorTourListItem | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const debouncedName = useDebounce(nameFilter, 400);
  const hasClientFilter = Boolean(difficulty || status);

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ cần trigger reset khi filter đổi
  useEffect(() => {
    setPage(1);
  }, [debouncedName, difficulty, status]);

  const filter = useMemo(() => ({ search: debouncedName || undefined }), [debouncedName]);
  const fetchPage = hasClientFilter ? 1 : page;
  const fetchSize = hasClientFilter ? CLIENT_FILTER_SAMPLE_SIZE : PAGE_SIZE;

  const { data, isLoading, isError, error } = useVendorTourList(filter, fetchPage, fetchSize);
  const { data: stats } = useVendorTourStats();
  const { deleteTour, publishTour, unpublishTour } = useVendorTourMutations();

  const fetchedTours = data?.tours ?? [];
  const filteredTours = hasClientFilter
    ? fetchedTours.filter(
        (tour) =>
          (!difficulty || tour.difficulty === difficulty) && (!status || tour.status === status)
      )
    : fetchedTours;

  const total = hasClientFilter ? filteredTours.length : (data?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tours = hasClientFilter
    ? filteredTours.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filteredTours;

  const statusTabs = useMemo(
    () => [
      { key: '', label: 'Tất cả', count: stats?.total },
      { key: 'DRAFT', label: 'Bản nháp', count: stats?.draft },
      { key: 'PUBLISHED', label: 'Đã công khai', count: stats?.published },
      { key: 'HIDDEN', label: 'Đã ẩn', count: stats?.hidden },
    ],
    [stats]
  );

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteTour.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Đã xóa tour.');
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Không thể xóa tour.'),
    });
  };

  const handlePublishConfirm = () => {
    if (!publishTarget) return;
    setPublishError(null);
    publishTour.mutate(publishTarget.id, {
      onSuccess: () => {
        setPublishTarget(null);
        toast.success('Đã công khai tour.');
      },
      onError: (err) =>
        setPublishError(err instanceof Error ? err.message : 'Không thể công khai tour.'),
    });
  };

  const handleUnpublishConfirm = () => {
    if (!unpublishTarget) return;
    unpublishTour.mutate(unpublishTarget.id, {
      onSuccess: () => {
        setUnpublishTarget(null);
        toast.success('Đã ngừng công khai tour.');
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Không thể ngừng công khai tour.'),
    });
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Danh sách Tour"
        description="Quản lý các chương trình tour khám phá, độ khó và lịch khởi hành của bạn"
        actions={
          <AppButton
            onClick={() => navigate(PATHS.VENDOR_MANAGER_TOUR_CREATE)}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-white bg-[#06261D] hover:bg-[#08241C] shadow-sm"
          >
            + Thêm tour mới
          </AppButton>
        }
      />

      <PortalFilterBar
        tabs={statusTabs}
        activeTab={status}
        onTabChange={(tab) => setStatus(tab as ApiStatus | '')}
        searchPlaceholder="Lọc theo tên tour..."
        searchValue={nameFilter}
        onSearchChange={setNameFilter}
        onSearchClear={() => setNameFilter('')}
        filters={
          <PortalFilterSelect
            label="Độ khó"
            value={difficulty}
            onChange={(val) => setDifficulty(val as ApiDifficulty | '')}
            options={DIFFICULTY_OPTIONS}
          />
        }
      />

      <div
        className="overflow-hidden rounded-3xl bg-white shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                {['Tên tour', 'Giá', 'Độ khó', 'Trạng thái', 'Thao tác'].map((col) => (
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
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Đang tải danh sách tour...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách tour:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : tours.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có tour nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                tours.map((tour) => (
                  <TourTableRow
                    key={tour.id}
                    tour={tour}
                    editPath={getVendorManagerTourEditPath(tour.id)}
                    previewPath={getVendorTourPreviewPath(tour.id)}
                    schedulesPath={getVendorManagerTourSchedulesPath(tour.id)}
                    editableStatuses={MANAGER_EDITABLE_STATUSES}
                    onDeleteClick={setDeleteTarget}
                    onPublishClick={setPublishTarget}
                    onUnpublishClick={setUnpublishTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <TourPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl p-6" style={{ backgroundColor: '#06261D' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#A9B8B2' }}>
            Tổng số tour
          </p>
          <p className="mt-1 text-3xl font-extrabold text-white">{stats?.total ?? '—'}</p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#A2EBD2' }}>
            Tất cả tour bạn quản lý
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Bản nháp
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {stats?.draft ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#DC2626' }}>
            Chưa công khai
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Tour hoạt động
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {stats?.published ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#16A34A' }}>
            Đang nhận khách
          </p>
        </div>
      </div>

      <DeleteTourConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        tourName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        isPending={deleteTour.isPending}
      />

      <PublishTourConfirmDialog
        open={publishTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPublishTarget(null);
            setPublishError(null);
          }
        }}
        tourName={publishTarget?.name ?? ''}
        onConfirm={handlePublishConfirm}
        isPending={publishTour.isPending}
        errorMessage={publishError}
      />

      <UnpublishTourConfirmDialog
        open={unpublishTarget !== null}
        onOpenChange={(open) => !open && setUnpublishTarget(null)}
        tourName={unpublishTarget?.name ?? ''}
        onConfirm={handleUnpublishConfirm}
        isPending={unpublishTour.isPending}
      />
    </div>
  );
}
