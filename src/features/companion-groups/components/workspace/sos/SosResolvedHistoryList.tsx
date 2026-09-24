import { CheckCircle2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getIncidentTypeMeta } from '../../../constants/sos';
import type { SosAlertResponse } from '../../../types/sos';
import { MemberAvatar } from '../../detail/MemberAvatar';

interface SosResolvedHistoryListProps {
  resolvedAlerts: SosAlertResponse[];
  isLoading: boolean;
  page: number;
  totalPages?: number;
  onPageChange: (newPage: number) => void;
}

export function SosResolvedHistoryList({
  resolvedAlerts,
  isLoading,
  page,
  totalPages = 1,
  onPageChange,
}: SosResolvedHistoryListProps) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
      <div className="border-b border-border pb-3">
        <h3 className="text-base font-extrabold text-foreground">Lịch Sử Tín Hiệu SOS</h3>
        <p className="text-xs text-muted-foreground">
          Danh sách các tín hiệu khẩn cấp đã được xử lý và đóng an toàn
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground p-4 text-center">Đang tải lịch sử...</p>
      ) : resolvedAlerts.length === 0 ? (
        <p className="text-xs text-muted-foreground p-6 text-center italic">
          Chưa có tín hiệu SOS nào đã đóng trong lịch sử.
        </p>
      ) : (
        <div className="space-y-3">
          {resolvedAlerts.map((alert) => {
            const meta = getIncidentTypeMeta(alert.incidentTypeCode);
            const Icon = meta.icon;

            return (
              <div
                key={alert.sosAlertId}
                className="rounded-2xl border border-border bg-background p-4 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MemberAvatar
                      fullName={alert.senderName}
                      avatarUrl={alert.senderAvatarUrl ?? undefined}
                      size="sm"
                    />
                    <span className="font-bold text-xs text-foreground">{alert.senderName}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${meta.badgeClass}`}
                    >
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Đã đóng
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleString('vi-VN')}
                    {alert.resolvedByName && ` • Đóng bởi: ${alert.resolvedByName}`}
                  </p>
                </div>

                {alert.message && (
                  <p className="text-xs text-foreground bg-muted/40 p-2.5 rounded-xl">
                    &ldquo;{alert.message}&rdquo;
                  </p>
                )}

                {alert.latitude != null && alert.longitude != null && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Tọa độ: {alert.latitude.toFixed(5)}, {alert.longitude.toFixed(5)}
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${encodeURIComponent(`${alert.latitude},${alert.longitude}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" /> Google Maps
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(0, page - 1))}
            disabled={page === 0}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" /> Trang trước
          </button>
          <span className="text-xs font-bold text-muted-foreground">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
          >
            Trang sau <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
