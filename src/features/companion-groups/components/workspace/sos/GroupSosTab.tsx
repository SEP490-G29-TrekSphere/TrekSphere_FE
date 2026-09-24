import { CheckCircle2, Siren } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/store/useToastStore';
import { getCurrentPosition } from '@/utils/geolocation';
import { useActiveSosAlerts } from '../../../hooks/sos/useActiveSosAlerts';
import { useResolveSos } from '../../../hooks/sos/useResolveSos';
import { useRespondSos } from '../../../hooks/sos/useRespondSos';
import { useSosAlertHistory } from '../../../hooks/sos/useSosAlertHistory';
import { useUpdateSosLocation } from '../../../hooks/sos/useUpdateSosLocation';
import { SosAlertCard } from './SosAlertCard';
import { SosLocationMap } from './SosLocationMap';
import { SosNationalHotlineBar } from './SosNationalHotlineBar';
import { SosResolvedHistoryList } from './SosResolvedHistoryList';

interface GroupSosTabProps {
  groupId: string;
  currentUserId?: string;
  isLeader: boolean;
}

const HISTORY_PAGE_SIZE = 10;

export function GroupSosTab({ groupId, currentUserId, isLeader }: GroupSosTabProps) {
  const [historyPage, setHistoryPage] = useState(0);
  const activeQuery = useActiveSosAlerts(groupId);
  const historyQuery = useSosAlertHistory(groupId, historyPage, HISTORY_PAGE_SIZE);
  const resolveSos = useResolveSos(groupId);
  const respondSos = useRespondSos(groupId);
  const updateSosLocation = useUpdateSosLocation(groupId);

  const activeAlerts = activeQuery.data ?? [];
  const resolvedAlerts = (historyQuery.data?.content ?? []).filter((a) => a.status === 'RESOLVED');

  const handleUpdateLiveLocation = (sosAlertId: string) => {
    getCurrentPosition()
      .then(({ latitude, longitude }) => {
        updateSosLocation.mutate(
          { sosAlertId, payload: { latitude, longitude } },
          {
            onSuccess: () => toast.success('Đã cập nhật vị trí GPS mới thành công!'),
            onError: (err: unknown) =>
              toast.error(err instanceof Error ? err.message : 'Không thể cập nhật vị trí.'),
          }
        );
      })
      .catch((err: Error) => {
        toast.error(`Không thể lấy GPS từ thiết bị: ${err.message}`);
      });
  };

  return (
    <div className="space-y-6">
      {/* 24/7 National Emergency Hotline Bar */}
      <SosNationalHotlineBar />

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
                <SosAlertCard
                  key={alert.sosAlertId}
                  alert={alert}
                  isSender={currentUserId === alert.senderId}
                  canResolve={isLeader || currentUserId === alert.senderId}
                  isResolving={resolveSos.isPending && resolveSos.variables === alert.sosAlertId}
                  onResolve={() => resolveSos.mutate(alert.sosAlertId)}
                  isResponding={respondSos.isPending && respondSos.variables === alert.sosAlertId}
                  onRespond={() =>
                    respondSos.mutate(alert.sosAlertId, {
                      onSuccess: () => toast.success('Đã tiếp nhận ứng cứu thành công!'),
                      onError: (err: unknown) =>
                        toast.error(err instanceof Error ? err.message : 'Không thể tiếp nhận.'),
                    })
                  }
                  isUpdatingLocation={
                    updateSosLocation.isPending &&
                    updateSosLocation.variables?.sosAlertId === alert.sosAlertId
                  }
                  onUpdateLocation={() => handleUpdateLiveLocation(alert.sosAlertId)}
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
      <SosResolvedHistoryList
        resolvedAlerts={resolvedAlerts}
        isLoading={historyQuery.isLoading}
        page={historyPage}
        totalPages={historyQuery.data?.totalPages}
        onPageChange={setHistoryPage}
      />
    </div>
  );
}
