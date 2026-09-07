import { Pencil, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import type {
  ApplicationStatus,
  VendorApplicationDetail,
} from '@/features/admin/services/vendorApplicationService';
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppSpinner,
  ConfirmActionDialog,
  PortalFilterBar,
  PortalPageHeader,
  PortalPagination,
  PortalStatusBadge,
} from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { CreateApplicationDialog } from '../components/CreateApplicationDialog';
import {
  useCreateDraftApplication,
  useMyVendorApplications,
  useResubmitVendorApplication,
  useSubmitVendorApplication,
  useUpdateVendorApplication,
} from '../hooks/useMyApplications';

export default function MyApplications() {
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<VendorApplicationDetail | null>(
    null
  );
  const [confirmSubmitId, setConfirmSubmitId] = useState<string | null>(null);
  const [confirmResubmitId, setConfirmResubmitId] = useState<string | null>(null);
  const pageSize = 10;

  const { mutate: createDraft, isPending: isCreating } = useCreateDraftApplication();
  const { mutate: submitApp, isPending: isSubmitting } = useSubmitVendorApplication();
  const { mutate: updateApp, isPending: isUpdating } = useUpdateVendorApplication();
  const { mutate: resubmitApp, isPending: isResubmitting } = useResubmitVendorApplication();

  const {
    data: responseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyVendorApplications({
    status: activeTab,
    keyword: appliedKeyword,
    page: currentPage,
    size: pageSize,
    sortBy: 'createdAt',
    sortDir: 'desc',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedKeyword(searchKeyword);
    setCurrentPage(0);
  };

  const handleCreateDraftSubmit = (formData: FormData) => {
    createDraft(formData, {
      onSuccess: () => {
        toast.success('Đã lưu bản nháp đơn đăng ký Vendor thành công!');
        setCreateDialogOpen(false);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Tạo bản nháp thất bại. Vui lòng thử lại.'
        );
      },
    });
  };

  const handleUpdateSubmit = (formData: FormData) => {
    if (!editingApplication) return;
    updateApp(
      { id: editingApplication.vendorApplicationId, formData },
      {
        onSuccess: () => {
          toast.success('Cập nhật thông tin đơn đăng ký Vendor thành công!');
          setEditingApplication(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng thử lại.');
        },
      }
    );
  };

  const handleConfirmSubmit = () => {
    if (!confirmSubmitId) return;
    submitApp(confirmSubmitId, {
      onSuccess: () => {
        toast.success('Đã nộp đơn đăng ký Vendor thành công!');
        setConfirmSubmitId(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Nộp đơn đăng ký thất bại. Vui lòng thử lại.'
        );
      },
    });
  };

  const handleConfirmResubmit = () => {
    if (!confirmResubmitId) return;
    resubmitApp(confirmResubmitId, {
      onSuccess: () => {
        toast.success('Đã nộp lại đơn đăng ký Vendor thành công!');
        setConfirmResubmitId(null);
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : 'Nộp lại đơn đăng ký thất bại. Vui lòng thử lại.'
        );
      },
    });
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const totalElements = responseData?.totalElements ?? 0;
  const totalPages = responseData?.totalPages ?? 0;
  const applications = responseData?.content ?? [];

  return (
    <div className="w-full space-y-6 pb-8">
      <PortalPageHeader
        title="Lịch sử đăng ký Vendor"
        description="Xem và quản lý các đơn đăng ký trở thành đối tác cung cấp dịch vụ của bạn"
        actions={
          <AppButton
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#0B3025] hover:bg-[#08221a] text-white font-bold rounded-xl px-5 h-10 flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Đăng ký Vendor mới
          </AppButton>
        }
      />

      <PortalFilterBar<ApplicationStatus | 'ALL'>
        tabs={[
          { key: 'ALL', label: 'Tất cả' },
          { key: 'PENDING', label: 'Chờ duyệt' },
          { key: 'APPROVED', label: 'Đã duyệt' },
          { key: 'REJECTED', label: 'Từ chối' },
          { key: 'DRAFT', label: 'Bản nháp' },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchPlaceholder="Tìm tên công ty..."
        searchValue={searchKeyword}
        onSearchChange={setSearchKeyword}
        onSearchSubmit={handleSearch}
        onSearchClear={() => {
          setSearchKeyword('');
          setAppliedKeyword('');
          setCurrentPage(0);
        }}
      />

      {/* Grid of applications */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-zinc-500 gap-3 bg-white rounded-2xl border border-[#E5E4DE]">
            <AppSpinner size="lg" />
            <p className="text-sm font-semibold">Đang tải lịch sử đăng ký...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-16 text-rose-600 gap-3 bg-white rounded-2xl border border-[#E5E4DE]">
            <p className="font-bold text-base">Không thể tải lịch sử đơn đăng ký</p>
            <p className="text-xs text-zinc-500 max-w-md text-center">
              {error instanceof Error ? error.message : 'Lỗi kết nối máy chủ.'}
            </p>
            <AppButton
              onClick={() => refetch()}
              variant="outline"
              className="mt-2 flex items-center gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 font-bold rounded-xl"
            >
              <RefreshCw className="h-4 w-4" />
              Thử lại
            </AppButton>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-[#E5E4DE]">
            <AppEmptyState
              title="Không tìm thấy đơn đăng ký nào"
              description="Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => (
              <AppCard
                key={app.vendorApplicationId}
                className="border-[#E5E4DE] hover:border-[#0B3025]/30 hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden bg-white p-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900 line-clamp-1">
                        {app.companyName}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Ngày nộp: {formatDate(app.createdAt)}
                      </p>
                    </div>
                    <PortalStatusBadge status={app.applicationStatus} />
                  </div>

                  {/* Business Description */}
                  <div className="text-sm text-zinc-600 bg-zinc-50 rounded-2xl p-4 min-h-[72px] line-clamp-3">
                    {app.businessDescription || 'Chưa có mô tả chi tiết về hoạt động kinh doanh.'}
                  </div>

                  {/* Contacts */}
                  <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2 text-xs font-semibold text-zinc-500 border-t border-[#F4F4F2]">
                    <div>
                      <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">
                        Email liên hệ
                      </span>
                      <span className="text-zinc-700 truncate block">{app.contactEmail}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">
                        Số điện thoại
                      </span>
                      <span className="text-zinc-700 truncate block">{app.contactPhone}</span>
                    </div>
                  </div>

                  {/* Rejection Reason if exists */}
                  {app.applicationStatus === 'REJECTED' && app.rejectionReason && (
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs">
                      <span className="font-bold text-rose-700 block mb-1">Lý do từ chối:</span>
                      <p className="text-rose-600 font-semibold leading-relaxed">
                        {app.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions footer */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#F4F4F2]">
                  {(app.applicationStatus === 'DRAFT' || app.applicationStatus === 'REJECTED') && (
                    <AppButton
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingApplication(app)}
                      className="h-9 px-4 rounded-xl text-zinc-600 hover:bg-zinc-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Chỉnh sửa
                    </AppButton>
                  )}
                  {app.applicationStatus === 'DRAFT' && (
                    <AppButton
                      size="sm"
                      onClick={() => setConfirmSubmitId(app.vendorApplicationId)}
                      className="h-9 px-4 rounded-xl bg-[#0B3025] hover:bg-[#08221a] text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      Nộp đơn ngay
                    </AppButton>
                  )}
                  {app.applicationStatus === 'REJECTED' && (
                    <AppButton
                      size="sm"
                      onClick={() => setConfirmResubmitId(app.vendorApplicationId)}
                      className="h-9 px-4 rounded-xl bg-[#0B3025] hover:bg-[#08221a] text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      Nộp lại đơn
                    </AppButton>
                  )}
                </div>
              </AppCard>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalElements > 0 && (
        <PortalPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          className="rounded-2xl border bg-white"
        />
      )}
      <CreateApplicationDialog
        open={createDialogOpen || !!editingApplication}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingApplication(null);
          }
        }}
        onSubmit={editingApplication ? handleUpdateSubmit : handleCreateDraftSubmit}
        isPending={isCreating || isUpdating}
        initialData={editingApplication || undefined}
      />
      {confirmSubmitId && (
        <ConfirmActionDialog
          title="Xác nhận nộp đơn"
          description="Bạn có chắc chắn muốn nộp đơn đăng ký này? Sau khi nộp đơn, bạn sẽ không thể chỉnh sửa và đơn sẽ được chuyển tới bộ phận Admin để duyệt."
          confirmLabel="Nộp đơn"
          cancelLabel="Hủy"
          isPending={isSubmitting}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmSubmitId(null)}
        />
      )}
      {confirmResubmitId && (
        <ConfirmActionDialog
          title="Xác nhận nộp lại đơn"
          description="Bạn có chắc chắn muốn nộp lại đơn đăng ký này? Đơn sẽ được chuyển tới bộ phận Admin để duyệt lại."
          confirmLabel="Nộp lại"
          cancelLabel="Hủy"
          isPending={isResubmitting}
          onConfirm={handleConfirmResubmit}
          onCancel={() => setConfirmResubmitId(null)}
        />
      )}
    </div>
  );
}
