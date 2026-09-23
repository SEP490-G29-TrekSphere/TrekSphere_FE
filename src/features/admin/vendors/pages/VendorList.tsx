import { useMemo, useState } from 'react';
import { PortalFilterBar, PortalPageHeader } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { VendorPagination } from '../components/VendorPagination';
import { VendorStatsCards } from '../components/VendorStatsCards';
import { VendorStatusDialog } from '../components/VendorStatusDialog';
import { VendorTableRow } from '../components/VendorTableRow';
import { useAdminVendorStats } from '../hooks/useAdminVendorStats';
import { useAdminVendors } from '../hooks/useAdminVendors';
import { useUpdateVendorStatus } from '../hooks/useUpdateVendorStatus';
import type { AdminVendor, VendorStatus } from '../types';

const PAGE_SIZE = 10;

export default function VendorList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VendorStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [vendorForStatusChange, setVendorForStatusChange] = useState<AdminVendor | null>(null);

  const filter = useMemo(() => ({ search, status }), [search, status]);

  const { data, isLoading, isError, error } = useAdminVendors(filter, page, PAGE_SIZE);
  const { data: stats } = useAdminVendorStats();
  const updateStatusMutation = useUpdateVendorStatus();

  const vendors = data?.vendors ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleConfirmStatusChange = (vendorId: string, nextStatus: VendorStatus) => {
    updateStatusMutation.mutate(
      { vendorId, status: nextStatus },
      {
        onSuccess: () => {
          toast.success('Đã cập nhật trạng thái nhà cung cấp.');
          setVendorForStatusChange(null);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại. Vui lòng thử lại.'
          );
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Quản lý Nhà cung cấp"
        description="Theo dõi hồ sơ, số liệu và trạng thái hoạt động của các đối tác Nhà cung cấp"
      />

      {/* Overview stats */}
      <VendorStatsCards stats={stats} />

      <PortalFilterBar<VendorStatus | 'ALL'>
        tabs={[
          { key: 'ALL', label: 'Tất cả', count: stats?.total },
          { key: 'ACTIVE', label: 'Đang hoạt động', count: stats?.active },
          { key: 'INACTIVE', label: 'Ngừng hoạt động', count: stats?.inactive },
          { key: 'REVOKED', label: 'Đã thu hồi', count: stats?.revoked },
        ]}
        activeTab={status}
        onTabChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        searchPlaceholder="Tìm theo tên, email hoặc công ty..."
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onSearchClear={() => {
          setSearch('');
          setPage(1);
        }}
      />

      {/* Data card */}
      <div
        className="overflow-hidden rounded-3xl bg-card shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Thông tin Nhà cung cấp
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Trạng thái
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Địa chỉ Email
                </th>
                <th
                  className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Đang tải danh sách nhà cung cấp...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách nhà cung cấp:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có nhà cung cấp nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <VendorTableRow
                    key={vendor.id}
                    vendor={vendor}
                    onChangeStatus={setVendorForStatusChange}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <VendorPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />
      </div>

      <VendorStatusDialog
        vendor={vendorForStatusChange}
        onOpenChange={(open) => !open && setVendorForStatusChange(null)}
        onConfirm={handleConfirmStatusChange}
        isPending={updateStatusMutation.isPending}
      />
    </div>
  );
}
