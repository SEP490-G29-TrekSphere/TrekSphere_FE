import { PATHS } from '@/constants';
import { AppIdDisplay, PortalPageHeader, PortalStatusBadge } from '@/shared/ui';
import type { ReportStatus } from '../../services/adminReportService';

export interface ReportDetailHeaderProps {
  id: string;
  status: ReportStatus;
}

export function ReportDetailHeader({ id, status }: ReportDetailHeaderProps) {
  return (
    <PortalPageHeader
      breadcrumbs={[{ label: 'Báo cáo', href: PATHS.ADMIN_REPORTS }, { label: 'Xử lý Báo cáo' }]}
      backButton={{ to: PATHS.ADMIN_REPORTS, label: 'Quay lại danh sách' }}
      title={
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#06261D]">
            Xử lý Báo cáo
          </h1>
          <AppIdDisplay id={id} />
        </div>
      }
      actions={
        <PortalStatusBadge
          status={status}
          label={status === 'PENDING' ? 'CHỜ XỬ LÝ' : status === 'RESOLVED' ? 'ĐÃ XỬ LÝ' : 'BỎ QUA'}
          variant={
            status === 'PENDING' ? 'destructive' : status === 'RESOLVED' ? 'success' : 'neutral'
          }
        />
      }
    />
  );
}
