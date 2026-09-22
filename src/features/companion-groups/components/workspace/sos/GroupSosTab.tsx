import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Siren } from 'lucide-react';
import { useState } from 'react';
import { getIncidentTypeLabel } from '../../../constants/sos';
import { useActiveSosAlerts } from '../../../hooks/sos/useActiveSosAlerts';
import { useResolveSos } from '../../../hooks/sos/useResolveSos';
import { useSosAlertHistory } from '../../../hooks/sos/useSosAlertHistory';
import type { SosAlertResponse } from '../../../types/sos';
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
  onResolve,
  isResolving,
}: {
  alert: SosAlertResponse;
  canResolve: boolean;
  onResolve: () => void;
  isResolving: boolean;
}) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-foreground">{alert.senderName}</span>
            <span className="rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
              {getIncidentTypeLabel(alert.incidentTypeCode)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {new Date(alert.createdAt).toLocaleString('vi-VN')}
          </p>
          {alert.message && (
            <p className="text-xs text-foreground mt-1.5 leading-relaxed">{alert.message}</p>
          )}
        </div>
        {canResolve && (
          <button
            type="button"
            onClick={onResolve}
            disabled={isResolving}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-[11px] font-bold text-destructive-foreground hover:bg-destructive/90 transition disabled:opacity-50 cursor-pointer"
          >
            {isResolving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Đóng tín hiệu SOS
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

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Siren className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-bold text-foreground">Tín hiệu SOS đang mở</h3>
        </div>

        {activeQuery.isLoading ? (
          <p className="text-xs text-muted-foreground">Đang tải...</p>
        ) : activeAlerts.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Không có tín hiệu SOS nào đang mở trong nhóm.
          </p>
        ) : (
          <div className="space-y-4">
            <SosLocationMap alerts={activeAlerts} heightClassName="h-[300px]" />
            <div className="space-y-2.5">
              {activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.sosAlertId}
                  alert={alert}
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

      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-foreground">Lịch sử tín hiệu SOS</h3>

        {historyQuery.isLoading ? (
          <p className="text-xs text-muted-foreground">Đang tải...</p>
        ) : resolvedAlerts.length === 0 ? (
          <p className="text-xs text-muted-foreground">Chưa có tín hiệu SOS nào đã đóng.</p>
        ) : (
          <div className="space-y-2.5">
            {resolvedAlerts.map((alert) => (
              <div
                key={alert.sosAlertId}
                className="rounded-2xl border border-border bg-background p-4 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground">{alert.senderName}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {getIncidentTypeLabel(alert.incidentTypeCode)}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    Đã đóng
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(alert.createdAt).toLocaleString('vi-VN')}
                  {alert.resolvedByName && ` • Đóng bởi ${alert.resolvedByName}`}
                </p>
                {alert.message && <p className="text-xs text-foreground">{alert.message}</p>}
                {(alert.latitude != null || alert.longitude != null) && (
                  <SosLocationMap alerts={[alert]} heightClassName="h-[160px]" />
                )}
              </div>
            ))}
          </div>
        )}

        {historyQuery.data && historyQuery.data.totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
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
