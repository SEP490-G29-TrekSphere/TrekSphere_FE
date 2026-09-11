import { useState } from 'react';
import { PortalPageHeader } from '@/shared/ui';
import { ReportTable } from '../components/reports/ReportTable';
import { useAdminReports } from '../hooks/useAdminReports';
import type { ReportStatus } from '../services/adminReportService';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('all');
  const [page, setPage] = useState(0);

  const statusFilter: ReportStatus | undefined =
    activeTab === 'pending'
      ? 'PENDING'
      : activeTab === 'resolved'
        ? 'RESOLVED'
        : activeTab === 'dismissed'
          ? 'DISMISSED'
          : undefined;

  const { data, isLoading, isError, error, isFetching } = useAdminReports({
    status: statusFilter,
    page: page,
    size: 10,
  });

  const reports = data?.content || [];
  const totalElements = data?.totalElements || 0;
  const totalPages = data?.totalPages || 1;

  if (isError) {
    console.error('Lỗi khi lấy danh sách báo cáo:', error);
  }

  return (
    <div className="w-full space-y-6 pb-10">
      <PortalPageHeader
        title="Danh sách Báo cáo Vi phạm"
        description="Kiểm tra và xử lý các nội dung vi phạm được người dùng báo cáo trong cộng đồng"
      />

      {/* Main Table Container */}
      {isLoading ? (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-[#0B3025] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-red-500 font-medium">
          Không thể tải danh sách báo cáo. Vui lòng thử lại sau.
        </div>
      ) : (
        <ReportTable
          reports={reports}
          totalElements={totalElements}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isFetching={isFetching}
        />
      )}
    </div>
  );
}
