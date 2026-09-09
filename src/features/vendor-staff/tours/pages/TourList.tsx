import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPartnerTourEditPath, getPartnerTourSchedulesPath, PATHS } from '@/constants';
import { RevertToDraftConfirmDialog } from '@/features/vendor-tours/components/RevertToDraftConfirmDialog';
import { SubmitApprovalConfirmDialog } from '@/features/vendor-tours/components/SubmitApprovalConfirmDialog';
import { TourPagination } from '@/features/vendor-tours/components/TourPagination';
import {
  STAFF_EDITABLE_STATUSES,
  TourTableRow,
} from '@/features/vendor-tours/components/TourTableRow';
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
  const [submitApprovalTarget, setSubmitApprovalTarget] = useState<VendorTourListItem | null>(null);
  const [revertTarget, setRevertTarget] = useState<VendorTourListItem | null>(null);

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
  const { submitTourForApproval, revertTourToDraft } = useVendorTourMutations();

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
      { key: 'DRAFT', label: 'Bản nháp' },
      { key: 'PENDING_APPROVAL', label: 'Chờ duyệt', count: stats?.pendingApproval },
      { key: 'APPROVED', label: 'Đã duyệt', count: stats?.approved },
      { key: 'REJECTED', label: 'Bị từ chối', count: stats?.rejected },
      { key: 'HIDDEN', label: 'Đã ẩn' },
    ],
    [stats]
  );

  const handleSubmitApprovalConfirm = () => {
    if (!submitApprovalTarget) return;
    submitTourForApproval.mutate(submitApprovalTarget.id, {
      onSuccess: () => {
        setSubmitApprovalTarget(null);
        toast.success('Đã gửi yêu cầu kiểm duyệt.');
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Không thể gửi yêu cầu kiểm duyệt.'),
    });
  };

  const handleRevertConfirm = () => {
    if (!revertTarget) return;
    revertTourToDraft.mutate(revertTarget.id, {
      onSuccess: () => {
        setRevertTarget(null);
        toast.success('Đã chuyển tour về Bản nháp.');
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Không thể chuyển trạng thái tour.'),
    });
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Danh sách Tour"
        description="Quản lý các chương trình tour khám phá, kiểm duyệt và cập nhật lịch trình"
        actions={
          <AppButton
            onClick={() => navigate(PATHS.PARTNER_TOUR_CREATE)}
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
                    editPath={getPartnerTourEditPath(tour.id)}
                    schedulesPath={getPartnerTourSchedulesPath(tour.id)}
                    editableStatuses={STAFF_EDITABLE_STATUSES}
                    onSubmitApprovalClick={setSubmitApprovalTarget}
                    onRevertClick={setRevertTarget}
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
            Tất cả tour bạn phụ trách
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Đang chờ duyệt
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {stats?.pendingApproval ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#DC2626' }}>
            Đang chờ Quản lý duyệt
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6" style={{ border: '1px solid #E6E2D1' }}>
          <p className="text-xs font-bold uppercase" style={{ color: '#6F7B75' }}>
            Tour hoạt động
          </p>
          <p className="mt-1 text-3xl font-extrabold" style={{ color: '#06261D' }}>
            {stats?.approved ?? '—'}
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: '#16A34A' }}>
            Đang nhận khách
          </p>
        </div>
      </div>

      <SubmitApprovalConfirmDialog
        open={submitApprovalTarget !== null}
        onOpenChange={(open) => !open && setSubmitApprovalTarget(null)}
        tourName={submitApprovalTarget?.name ?? ''}
        onConfirm={handleSubmitApprovalConfirm}
        isPending={submitTourForApproval.isPending}
      />

      <RevertToDraftConfirmDialog
        open={revertTarget !== null}
        onOpenChange={(open) => !open && setRevertTarget(null)}
        description={`Chuyển tour "${revertTarget?.name ?? ''}" về Bản nháp để chỉnh sửa lại?`}
        onConfirm={handleRevertConfirm}
        isPending={revertTourToDraft.isPending}
      />
    </div>
  );
}
