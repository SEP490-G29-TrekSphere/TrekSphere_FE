import { Loader2, MapPin, Megaphone, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { INCIDENT_TYPE_OPTIONS } from '../../../../constants/sos';
import type { IncidentType } from '../../../../types/sos';
import { SosLocationMap } from '../SosLocationMap';
import { SosOfflineFallbackSection } from './SosOfflineFallbackSection';

export type GpsState =
  | { status: 'loading' }
  | { status: 'success'; latitude: number; longitude: number }
  | { status: 'error'; message: string };

interface SosBroadcastFormProps {
  groupId: string;
  selectedIncident: IncidentType;
  onSelectIncident: (type: IncidentType) => void;
  customNote: string;
  onChangeCustomNote: (note: string) => void;
  gps: GpsState;
  isPending: boolean;
  isError: boolean;
  leaderPhone?: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function SosBroadcastForm({
  groupId,
  selectedIncident,
  onSelectIncident,
  customNote,
  onChangeCustomNote,
  gps,
  isPending,
  isError,
  leaderPhone,
  onSubmit,
}: SosBroadcastFormProps) {
  const gpsCoords =
    gps.status === 'success' ? { latitude: gps.latitude, longitude: gps.longitude } : null;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 sm:p-4"
    >
      <div className="flex items-center gap-2 text-destructive font-extrabold text-xs">
        <Megaphone className="h-4 w-4 shrink-0" />
        <span>1. PHÁT TÍN HIỆU SOS TỚI TOÀN NHÓM</span>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-foreground">Loại sự cố đang gặp phải:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {INCIDENT_TYPE_OPTIONS.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => onSelectIncident(type.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border p-2.5 text-left text-[11px] font-bold transition cursor-pointer',
                  selectedIncident === type.id
                    ? 'border-destructive bg-destructive text-destructive-foreground shadow-xs'
                    : 'border-border bg-background text-foreground hover:border-destructive/50'
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* GPS state */}
      {gps.status === 'loading' && (
        <div className="flex items-center gap-2 rounded-lg bg-background p-2.5 border border-border text-[11px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          Đang lấy vị trí GPS hiện tại...
        </div>
      )}
      {gps.status === 'success' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] bg-background px-2.5 py-1 rounded-lg border border-border flex-wrap gap-1">
            <span className="text-muted-foreground flex items-center gap-1 font-bold">
              <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" /> Tọa độ thiết bị:
            </span>
            <span className="font-mono font-bold text-foreground">
              {gps.latitude.toFixed(6)}, {gps.longitude.toFixed(6)}
            </span>
          </div>
          <SosLocationMap
            alerts={[
              {
                sosAlertId: 'preview',
                groupTripId: '',
                matchingGroupId: groupId,
                senderId: '',
                senderName: 'Vị trí của bạn',
                incidentTypeCode: selectedIncident,
                message: null,
                latitude: gps.latitude,
                longitude: gps.longitude,
                status: 'OPEN',
                resolvedById: null,
                resolvedByName: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ]}
            heightClassName="h-[160px]"
          />
        </div>
      )}
      {gps.status === 'error' && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-2.5 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-400">
          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Không lấy được vị trí — SOS vẫn gửi được, hãy mô tả rõ vị trí trong ghi chú.</span>
        </div>
      )}

      <textarea
        rows={2}
        value={customNote}
        onChange={(e) => onChangeCustomNote(e.target.value)}
        placeholder="Ghi chú thêm tình trạng (vd: Đau cổ chân ở chặng 2, không tự di chuyển được...)"
        className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-destructive"
      />

      {/* Always-visible offline SMS fallback */}
      <SosOfflineFallbackSection
        isError={isError}
        selectedIncident={selectedIncident}
        customNote={customNote}
        leaderPhone={leaderPhone}
        gpsCoords={gpsCoords}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive py-3 text-xs font-black text-destructive-foreground shadow-md hover:bg-destructive/90 transition disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldAlert className="h-4 w-4" />
        )}
        PHÁT TÍN HIỆU SOS CHO CẢ NHÓM (ONLINE)
      </button>
    </form>
  );
}
