import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import {
  AppButton,
  AppTable,
  AppTableBody,
  AppTableCell,
  AppTableHead,
  AppTableHeader,
  AppTableRow,
  PortalDataTableShell,
  PortalFilterBar,
  PortalPageHeader,
  PortalStatusBadge,
} from '@/shared/ui';
import { useVendorApplicationStats, useVendorApplications } from '../hooks/useVendorApplications';
import type { ApplicationStatus } from '../services/vendorApplicationService';

export default function Applications() {
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // 0-based page number cho BE API
  const pageSize = 10;

  // Lấy dữ liệu danh sách từ API qua React Query hook
  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useVendorApplications({
    status: activeTab,
    keyword: appliedKeyword,
    page: currentPage,
    size: pageSize,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  // Lấy dữ liệu thống kê
  const { data: statsData } = useVendorApplicationStats();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const handleTabChange = (status: ApplicationStatus | 'ALL') => {
    setActiveTab(status);
    setCurrentPage(0);
  };

  const handlePageChange = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < (responseData?.totalPages ?? 1)) {
      setCurrentPage(pageIndex);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const totalElements = responseData?.totalElements ?? 0;
  const totalPages = responseData?.totalPages ?? 0;
  const applications = responseData?.content ?? [];

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Duyệt Nhà Cung Cấp"
        description="Quản lý và xét duyệt các hồ sơ đăng ký đối tác Vendor trên nền tảng TrekSphere"
      />

      <PortalFilterBar<ApplicationStatus | 'ALL'>
        tabs={[
          { key: 'ALL', label: 'Tất cả', count: statsData?.all },
          { key: 'PENDING', label: 'Chờ duyệt', count: statsData?.pending },
          { key: 'APPROVED', label: 'Đã duyệt', count: statsData?.approved },
          { key: 'REJECTED', label: 'Từ chối', count: statsData?.rejected },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchPlaceholder="Tìm tên công ty, email..."
        searchValue={searchKeyword}
        onSearchChange={setSearchKeyword}
        onSearchSubmit={handleSearch}
        onSearchClear={() => {
          setSearchKeyword('');
          setAppliedKeyword('');
          setCurrentPage(0);
        }}
      />

      <PortalDataTableShell
        isLoading={isLoading}
        loadingMessage="Đang tải danh sách đơn đăng ký..."
        isError={isError}
        errorMessage={
          error instanceof Error ? error.message : 'Không thể tải danh sách đơn đăng ký.'
        }
        onRetry={() => refetch()}
        isEmpty={applications.length === 0}
        emptyTitle="Không tìm thấy đơn đăng ký nào"
        emptyDescription="Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm."
        pagination={{
          currentPage,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: handlePageChange,
        }}
      >
        <AppTable>
          <AppTableHeader className="bg-[#FAF9F5] border-b border-[#E5E4DE]">
            <AppTableRow className="hover:bg-transparent">
              <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                CÔNG TY & NGƯỜI ĐĂNG KÝ
              </AppTableHead>
              <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                LIÊN HỆ
              </AppTableHead>
              <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                NGÀY GỬI
              </AppTableHead>
              <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6">
                TRẠNG THÁI
              </AppTableHead>
              <AppTableHead className="font-bold text-zinc-400 text-xs py-4 px-6 text-right">
                HÀNH ĐỘNG
              </AppTableHead>
            </AppTableRow>
          </AppTableHeader>
          <AppTableBody>
            {applications.map((app) => (
              <AppTableRow
                key={app.vendorApplicationId}
                className="border-b border-[#F4F4F2] hover:bg-[#FAF9F5] transition-colors"
              >
                <AppTableCell className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0B3025] text-white text-sm font-bold shadow-sm overflow-hidden">
                      {app.applicant.avatarUrl ? (
                        <img
                          src={app.applicant.avatarUrl}
                          alt={app.applicant.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        app.companyName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-800 text-sm">{app.companyName}</span>
                      <span className="text-xs text-zinc-500 font-medium">
                        Người nộp: {app.applicant.fullName || app.applicant.email}
                      </span>
                    </div>
                  </div>
                </AppTableCell>
                <AppTableCell className="py-4 px-6">
                  <div className="flex flex-col text-xs text-zinc-600 font-medium">
                    <span>{app.contactEmail}</span>
                    <span className="text-zinc-400">{app.contactPhone}</span>
                  </div>
                </AppTableCell>
                <AppTableCell className="py-4 px-6 text-zinc-600 text-sm font-semibold">
                  {formatDate(app.createdAt)}
                </AppTableCell>
                <AppTableCell className="py-4 px-6">
                  <PortalStatusBadge status={app.applicationStatus} />
                </AppTableCell>
                <AppTableCell className="py-4 px-6 text-right">
                  <Link to={PATHS.ADMIN_APPLICATION_DETAIL.replace(':id', app.vendorApplicationId)}>
                    <AppButton
                      variant="outline"
                      className="border-[#E5E4DE] text-zinc-700 hover:bg-[#F4F4F2] font-semibold text-xs py-1.5 px-4 rounded-xl"
                    >
                      Xem chi tiết
                    </AppButton>
                  </Link>
                </AppTableCell>
              </AppTableRow>
            ))}
          </AppTableBody>
        </AppTable>
      </PortalDataTableShell>
    </div>
  );
}
