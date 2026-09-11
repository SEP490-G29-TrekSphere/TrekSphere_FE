import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortalFilterBar, PortalPageHeader } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { AccountPagination } from '../components/AccountPagination';
import { AccountTableRow } from '../components/AccountTableRow';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAccountMutations } from '../hooks/useAccountMutations';
import { useAdminAccounts } from '../hooks/useAdminAccounts';
import type { AccountRole, AdminAccount } from '../types';

const PAGE_SIZE = 10;

export default function AccountList() {
  const [filterRole, setFilterRole] = useState<AccountRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingLockAccount, setPendingLockAccount] = useState<AdminAccount | null>(null);

  const filter = useMemo(() => ({ role: filterRole, search }), [filterRole, search]);

  const { data, isLoading, isError, error } = useAdminAccounts(filter, page, PAGE_SIZE);
  const { lock, unlock } = useAccountMutations();

  const navigate = useNavigate();

  const accounts = data?.accounts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleStatusAction = (account: AdminAccount) => {
    if (account.status === 'ACTIVE') {
      setPendingLockAccount(account);
      return;
    }

    void unlock
      .mutateAsync(account.id)
      .then(() => {
        toast.success(`Đã mở khóa tài khoản "${account.fullName}"`);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Mở khóa thất bại');
      });
  };

  const handleConfirmLock = () => {
    if (!pendingLockAccount) return;

    void lock
      .mutateAsync(pendingLockAccount.id)
      .then(() => {
        toast.success(`Đã khóa tài khoản "${pendingLockAccount.fullName}"`);
        setPendingLockAccount(null);
      })
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : 'Khóa tài khoản thất bại');
      });
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Quản lý tài khoản"
        description="Quản lý thông tin và phân quyền các tài khoản người dùng trong hệ thống"
      />

      <PortalFilterBar<AccountRole | 'ALL'>
        tabs={[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'trekker', label: 'Khách du lịch' },
          { key: 'vendor_manager', label: 'Quản lý nhà cung cấp' },
          { key: 'vendor_staff', label: 'Nhân viên nhà cung cấp' },
          { key: 'coordinator', label: 'Hướng dẫn viên' },
          { key: 'admin', label: 'Quản trị viên' },
        ]}
        activeTab={filterRole}
        onTabChange={(role) => {
          setFilterRole(role);
          setPage(1);
        }}
        searchPlaceholder="Tìm kiếm tài khoản..."
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

      {/* Data table */}
      <div
        className="overflow-hidden rounded-3xl bg-card shadow-sm"
        style={{ border: '1px solid #E6E2D1' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead style={{ backgroundColor: '#F0EEE6' }}>
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Họ và tên
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Email
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Loại tài khoản
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider"
                  style={{ color: '#06261D' }}
                >
                  Trạng thái
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
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Đang tải danh sách tài khoản...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#DC2626' }}
                  >
                    Không thể tải danh sách tài khoản:{' '}
                    {error instanceof Error ? error.message : 'Lỗi không xác định'}
                  </td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm"
                    style={{ color: '#6F7B75' }}
                  >
                    Không có tài khoản nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <AccountTableRow
                    key={account.id}
                    account={account}
                    onViewDetail={(acc) => navigate(`/admin/accounts/${acc.id}`)}
                    onToggleLock={handleStatusAction}
                    isStatusPending={
                      (lock.isPending && lock.variables === account.id) ||
                      (unlock.isPending && unlock.variables === account.id)
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <AccountPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalCount={total}
          pageSize={PAGE_SIZE}
        />
      </div>

      <ConfirmDialog
        open={Boolean(pendingLockAccount)}
        onOpenChange={(open) => {
          if (!open) setPendingLockAccount(null);
        }}
        variant="lock"
        accountName={pendingLockAccount?.fullName ?? ''}
        onConfirm={handleConfirmLock}
        isPending={lock.isPending}
      />
    </div>
  );
}
