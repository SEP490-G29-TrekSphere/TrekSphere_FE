import { useMemo, useState } from 'react';
import { PortalFilterBar, PortalPageHeader } from '@/shared/ui';
import { ReportTable } from '../components/reports/ReportTable';
import { useAdminReports } from '../hooks/useAdminReports';
import type { ReportStatus } from '../services/adminReportService';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);

  const statusFilter: ReportStatus | undefined =
    activeTab === 'ALL' ? undefined : (activeTab as ReportStatus);

  const { data, isLoading, isError, isFetching, refetch } = useAdminReports({
    status: statusFilter,
    page: page,
    size: 10,
  });

  const reports = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;

  const filteredReports = useMemo(() => {
    if (!searchKeyword.trim()) return reports;
    const query = searchKeyword.toLowerCase().trim();
    return reports.filter((r) => {
      const name = r.reporterFullName?.toLowerCase() || '';
      const email = r.reporterEmail?.toLowerCase() || '';
      const title = r.targetTitle?.toLowerCase() || '';
      const reason = r.reason?.toLowerCase() || '';
      return (
        name.includes(query) ||
        email.includes(query) ||
        title.includes(query) ||
        reason.includes(query)
      );
    });
  }, [reports, searchKeyword]);

  return (
    <div className="w-full space-y-6 pb-10">
      <PortalPageHeader
        title="Danh sách Báo cáo Vi phạm"
        description="Kiểm tra và xử lý các nội dung vi phạm được người dùng báo cáo trong cộng đồng"
      />

      <PortalFilterBar<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>
        tabs={[
          { key: 'ALL', label: 'Tất cả', count: activeTab === 'ALL' ? totalElements : undefined },
          {
            key: 'PENDING',
            label: 'Chờ xử lý',
            count: activeTab === 'PENDING' ? totalElements : undefined,
          },
          {
            key: 'RESOLVED',
            label: 'Đã xử lý',
            count: activeTab === 'RESOLVED' ? totalElements : undefined,
          },
          {
            key: 'DISMISSED',
            label: 'Bỏ qua',
            count: activeTab === 'DISMISSED' ? totalElements : undefined,
          },
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setPage(0);
        }}
        searchPlaceholder="Tìm theo người báo cáo, tiêu đề, lý do..."
        searchValue={searchKeyword}
        onSearchChange={(val) => {
          setSearchKeyword(val);
          setPage(0);
        }}
        onSearchClear={() => {
          setSearchKeyword('');
          setPage(0);
        }}
      />

      {/* Main Table Container */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-[#0B3025] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#FAF9F5] border border-[#E5E4DE] rounded-2xl p-6">
          <p className="text-sm font-semibold text-red-600 mb-2">
            Không thể tải danh sách báo cáo vi phạm.
          </p>
          <p className="text-xs text-zinc-500 max-w-md mb-4">
            Đã có lỗi xảy ra trong quá trình truy xuất dữ liệu từ máy chủ. Vui lòng thử lại sau.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full px-5 py-2 text-xs font-bold text-white bg-[#0B3025] hover:bg-[#06261D] transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <ReportTable
          reports={filteredReports}
          totalElements={filteredReports.length}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          isFetching={isFetching}
        />
      )}
    </div>
  );
}
