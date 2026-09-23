import { ArrowRight, Phone, Siren } from 'lucide-react';
import { getSafeTelUri } from '@/utils/sanitize';
import { getIncidentTypeMeta } from '../../../constants/sos';
import type { SosAlertResponse } from '../../../types/sos';
import { formatRelativeTime } from '../../../utils/workspaceDate';

interface GroupSosBannerProps {
  alerts: SosAlertResponse[];
  onViewSos: () => void;
}

export function GroupSosBanner({ alerts, onViewSos }: GroupSosBannerProps) {
  const openAlerts = alerts.filter((a) => a.status === 'OPEN');
  if (openAlerts.length === 0) return null;

  const latestAlert = openAlerts[0];
  const meta = getIncidentTypeMeta(latestAlert.incidentTypeCode);
  const Icon = meta.icon;
  const safeTelUri = getSafeTelUri(latestAlert.senderPhone);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="relative overflow-hidden rounded-2xl border-2 border-rose-500/80 bg-rose-500/10 p-3.5 sm:p-4 shadow-md backdrop-blur-xs transition-all animate-pulse"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="relative shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-rose-600 text-white shadow-xs">
            <Siren className="h-5 w-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                BÁO ĐỘNG SOS KHẨN CẤP ({openAlerts.length})
              </span>
              <span className="text-xs font-black text-rose-700 dark:text-rose-300 flex items-center gap-1">
                <Icon className="h-3.5 w-3.5" />
                {meta.shortLabel}
              </span>
              <span className="text-[11px] text-muted-foreground">
                • {formatRelativeTime(latestAlert.createdAt)}
              </span>
            </div>

            <p className="text-xs font-semibold text-foreground leading-snug">
              Thành viên{' '}
              <strong className="text-rose-600 dark:text-rose-400 font-extrabold">
                {latestAlert.senderName}
              </strong>{' '}
              đang phát tín hiệu cần cứu hộ
              {latestAlert.message ? `: "${latestAlert.message}"` : '.'}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-auto flex items-center justify-end sm:justify-start lg:justify-end gap-2 shrink-0 pt-1 lg:pt-0 border-t border-rose-500/20 lg:border-0">
          {safeTelUri && (
            <a
              href={safeTelUri}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-background border border-border px-3 py-2 text-xs font-bold text-foreground hover:bg-muted transition shadow-2xs whitespace-nowrap"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Gọi: {latestAlert.senderPhone}
            </a>
          )}

          <button
            type="button"
            onClick={onViewSos}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-rose-700 transition shadow-xs cursor-pointer whitespace-nowrap"
          >
            Xem Bản Đồ & Cứu Hộ
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}
