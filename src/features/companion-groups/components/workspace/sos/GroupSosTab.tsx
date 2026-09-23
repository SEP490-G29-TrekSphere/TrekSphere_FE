import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Phone,
  Siren,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/store/useToastStore';
import { getIncidentTypeMeta } from '../../../constants/sos';
import { useActiveSosAlerts } from '../../../hooks/sos/useActiveSosAlerts';
import { useResolveSos } from '../../../hooks/sos/useResolveSos';
import { useSosAlertHistory } from '../../../hooks/sos/useSosAlertHistory';
import type { SosAlertResponse } from '../../../types/sos';
import { formatRelativeTime } from '../../../utils/workspaceDate';
import { MemberAvatar } from '../../detail/MemberAvatar';
import { SosLocationMap } from './SosLocationMap';

interface GroupSosTabProps {
  groupId: string;
  currentUserId?: string;
  isLeader: boolean;
}

const HISTORY_PAGE_SIZE = 10;

function AlertCard({
  alert,
  canResolve,
  isSender,
  onResolve,
  isResolving,
}: {
  alert: SosAlertResponse;
  canResolve: boolean;
  isSender: boolean;
  onResolve: () => void;
  isResolving: boolean;
}) {
  const meta = getIncidentTypeMeta(alert.incidentTypeCode);
  const Icon = meta.icon;

  const handleCopyGps = () => {
    if (alert.latitude != null && alert.longitude != null) {
      const coords = `${alert.latitude}, ${alert.longitude}`;
      navigator.clipboard.writeText(coords);
      toast.success(`Đã sao chép tọa độ GPS: ${coords}`);
    }
  };

  return (
    <div
      className={`rounded-2xl border-2 p-4 sm:p-5 space-y-4 shadow-sm transition-all ${meta.borderClass}`}
    >
      {/* Top row: Victim profile + Incident badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-3">
          <MemberAvatar
            fullName={alert.senderName}
            avatarUrl={alert.senderAvatarUrl ?? undefined}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-foreground">{alert.senderName}</span>
              {isSender && (
                <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[9px] font-black text-primary">
                  Bạn
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${meta.badgeClass}`}
              >
                <Icon className="h-3 w-3" />
                {meta.label}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Phát tín hiệu: <strong>{formatRelativeTime(alert.createdAt)}</strong> (
              {new Date(alert.createdAt).toLocaleString('vi-VN')})
            </p>
          </div>
        </div>

        {/* Quick Phone Call Button */}
        {alert.senderPhone && (
          <a
            href={`tel:${alert.senderPhone}`}
            className="inline-flex items-center justify-center gap-1.5 self-stretch sm:self-center rounded-xl bg-background border border-border px-3.5 py-2 sm:py-1.5 text-xs font-bold text-foreground hover:bg-muted transition shadow-2xs"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Gọi: {alert.senderPhone}
          </a>
        )}
      </div>

      {/* Message content */}
      {alert.message && (
        <div className="rounded-xl bg-background/80 border border-border/60 p-3 text-xs text-foreground leading-relaxed">
          <span className="font-bold text-destructive">Lời nhắn khẩn cấp: </span>
          &ldquo;{alert.message}&rdquo;
        </div>
      )}

      {/* Location info & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {alert.latitude != null && alert.longitude != null ? (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1 font-mono font-bold text-foreground bg-muted/70 px-2.5 py-1 rounded-lg border border-border text-[11px]">
              <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              {alert.latitude.toFixed(6)}, {alert.longitude.toFixed(6)}
            </span>

            <button
              type="button"
              onClick={handleCopyGps}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
              title="Sao chép tọa độ GPS"
            >
              <Copy className="h-3 w-3 shrink-0" />
              Sao chép GPS
            </button>

            <a
              href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-2.5 py-1 text-[11px] font-bold hover:opacity-90 transition"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              Google Maps
            </a>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground italic">
            Không có dữ liệu tọa độ GPS thiết bị.
          </span>
        )}

        {/* Resolve SOS Button */}
        {canResolve && (
          <button
            type="button"
            onClick={onResolve}
            disabled={isResolving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-destructive px-4 py-2.5 sm:py-2 text-xs font-extrabold text-destructive-foreground hover:bg-destructive/90 transition shadow-xs disabled:opacity-50 cursor-pointer self-stretch sm:self-center"
          >
            {isResolving ? (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            {isSender ? 'Tôi đã an toàn (Đóng SOS)' : 'Xác nhận đã xử lý (Đóng SOS)'}
          </button>
        )}
      </div>
    </div>
  );
}

export function GroupSosTab({ groupId, currentUserId, isLeader }: GroupSosTabProps) {
  const [historyPage, setHistoryPage] = useState(0);
  const activeQuery = useActiveSosAlerts(groupId);
  const historyQuery = useSosAlertHistory(groupId, historyPage, HISTORY_PAGE_SIZE);
  const resolveSos = useResolveSos(groupId);

  const activeAlerts = activeQuery.data ?? [];
  const resolvedAlerts = (historyQuery.data?.content ?? []).filter((a) => a.status === 'RESOLVED');

  return (
    <div className="space-y-6">
      {/* Section: Đang mở */}
      <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Siren className="h-5 w-5 text-destructive animate-pulse shrink-0" />
            <div>
              <h3 className="text-base font-extrabold text-foreground">Tín Hiệu SOS Đang Mở</h3>
              <p className="text-xs text-muted-foreground">
                Các sự cố khẩn cấp đang cần sự hỗ trợ của các thành viên trong đoàn
              </p>
            </div>
          </div>
          {activeAlerts.length > 0 && (
            <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-black text-white animate-pulse">
              {activeAlerts.length} KHẨN CẤP
            </span>
          )}
        </div>

        {activeQuery.isLoading ? (
          <p className="text-xs text-muted-foreground p-4 text-center">Đang tải tín hiệu SOS...</p>
        ) : activeAlerts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-border bg-muted/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-foreground">
              Không có tín hiệu SOS nào đang mở trong nhóm.
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Tất cả các thành viên đang an toàn trên hành trình.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <SosLocationMap alerts={activeAlerts} heightClassName="h-[320px]" />
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.sosAlertId}
                  alert={alert}
                  isSender={currentUserId === alert.senderId}
                  canResolve={isLeader || currentUserId === alert.senderId}
                  isResolving={resolveSos.isPending && resolveSos.variables === alert.sosAlertId}
                  onResolve={() => resolveSos.mutate(alert.sosAlertId)}
                />
              ))}
            </div>
          </div>
        )}
        {resolveSos.isError && (
          <p className="text-xs font-semibold text-destructive">
            {resolveSos.error instanceof Error
              ? resolveSos.error.message
              : 'Không thể đóng tín hiệu SOS này.'}
          </p>
        )}
      </div>

      {/* Section: Lịch sử */}
      <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-border pb-3">
          <h3 className="text-base font-extrabold text-foreground">Lịch Sử Tín Hiệu SOS</h3>
          <p className="text-xs text-muted-foreground">
            Danh sách các tín hiệu khẩn cấp đã được xử lý và đóng an toàn
          </p>
        </div>

        {historyQuery.isLoading ? (
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
                        href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noreferrer"
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

        {historyQuery.data && historyQuery.data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setHistoryPage((p) => Math.max(0, p - 1))}
              disabled={historyPage === 0}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Trước
            </button>
            <span className="text-[11px] text-muted-foreground">
              Trang {historyPage + 1}/{historyQuery.data.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setHistoryPage((p) => p + 1)}
              disabled={historyQuery.data.last}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[11px] font-bold text-foreground disabled:opacity-40 cursor-pointer"
            >
              Sau <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
