import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { AppButton, AppCard, AppCardContent, AppEmptyState, AppSpinner } from '@/shared/ui';

export interface PortalPaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PortalPagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize = 10,
  onPageChange,
  className = '',
}: PortalPaginationProps) {
  if (totalPages <= 1 && !totalElements) return null;

  const startItem = totalElements ? currentPage * pageSize + 1 : undefined;
  const endItem = totalElements ? Math.min((currentPage + 1) * pageSize, totalElements) : undefined;

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#E5E4DE] bg-[#FAF9F5]/40',
        className
      )}
    >
      <div className="text-xs text-zinc-500 font-medium">
        {totalElements !== undefined ? (
          <>
            Hiển thị <span className="font-bold text-zinc-800">{startItem}</span> -{' '}
            <span className="font-bold text-zinc-800">{endItem}</span> trên{' '}
            <span className="font-bold text-zinc-800">{totalElements}</span> kết quả
          </>
        ) : (
          <>
            Trang <span className="font-bold text-zinc-800">{currentPage + 1}</span> /{' '}
            <span className="font-bold text-zinc-800">{Math.max(1, totalPages)}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <AppButton
          variant="outline"
          size="sm"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-xl border-[#E5E4DE] h-8 px-3 text-xs font-semibold"
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Trước
        </AppButton>

        <span className="text-xs font-semibold px-2 text-zinc-700">
          {currentPage + 1} / {Math.max(1, totalPages)}
        </span>

        <AppButton
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-xl border-[#E5E4DE] h-8 px-3 text-xs font-semibold"
        >
          Sau <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </AppButton>
      </div>
    </div>
  );
}

export interface PortalDataTableShellProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  pagination?: PortalPaginationProps;
  className?: string;
}

export function PortalDataTableShell({
  children,
  isLoading = false,
  loadingMessage = 'Đang tải dữ liệu...',
  isError = false,
  errorMessage = 'Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.',
  onRetry,
  isEmpty = false,
  emptyTitle = 'Không tìm thấy dữ liệu',
  emptyDescription = 'Hiện chưa có mục nào hoặc không khớp với bộ lọc hiện tại.',
  emptyAction,
  pagination,
  className = '',
}: PortalDataTableShellProps) {
  return (
    <AppCard
      className={cn('border-[#E5E4DE] shadow-sm rounded-2xl overflow-hidden bg-white', className)}
    >
      <AppCardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 text-zinc-500 gap-3">
            <AppSpinner size="lg" />
            <p className="text-sm font-semibold">{loadingMessage}</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-16 text-rose-600 gap-3">
            <p className="text-sm font-semibold text-center">{errorMessage}</p>
            {onRetry && (
              <AppButton
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 font-bold mt-1"
              >
                Thử lại
              </AppButton>
            )}
          </div>
        ) : isEmpty ? (
          <div className="py-12 flex flex-col items-center">
            <AppEmptyState title={emptyTitle} description={emptyDescription} />
            {emptyAction && <div className="mt-4">{emptyAction}</div>}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">{children}</div>
            {pagination && <PortalPagination {...pagination} />}
          </>
        )}
      </AppCardContent>
    </AppCard>
  );
}
