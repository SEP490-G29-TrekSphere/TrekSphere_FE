import {
  AlertTriangle,
  Loader2,
  MapPin,
  Megaphone,
  PhoneCall,
  ShieldAlert,
  Siren,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';
import { getCurrentPosition } from '@/utils/geolocation';
import { INCIDENT_TYPE_OPTIONS } from '../../constants/sos';
import { useSendSosAlert } from '../../hooks/sos/useSendSosAlert';
import type { IncidentType } from '../../types/sos';
import { SosLocationMap } from './sos/SosLocationMap';

interface GroupSOSModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  leaderName?: string;
  leaderPhone?: string;
}

// 112 & 115 are ALWAYS guaranteed national fallback hotlines
const NATIONAL_HOTLINES = [
  {
    name: 'Tổng đài Tìm kiếm Cứu nạn Quốc gia',
    number: '112',
    desc: 'Yêu cầu trợ giúp khẩn cấp toàn quốc 24/7',
    badge: 'Quốc gia (24/7)',
  },
  {
    name: 'Cấp cứu Y tế Quốc gia',
    number: '115',
    desc: 'Hỗ trợ sự cố sức khỏe, chấn thương',
    badge: 'Y tế khẩn cấp',
  },
];

type GpsState =
  | { status: 'loading' }
  | { status: 'success'; latitude: number; longitude: number }
  | { status: 'error'; message: string };

export function GroupSOSModal({
  groupId,
  isOpen,
  onClose,
  leaderName = 'Trưởng nhóm',
  leaderPhone,
}: GroupSOSModalProps) {
  const sendSosAlert = useSendSosAlert(groupId);
  const [selectedIncident, setSelectedIncident] = useState<IncidentType>('INJURY');
  const [customNote, setCustomNote] = useState('');
  const [isSuccessSent, setIsSuccessSent] = useState(false);
  const [gps, setGps] = useState<GpsState>({ status: 'loading' });
  const idempotencyKeyRef = useRef<string>('');

  const modalRef = useClickOutside<HTMLDivElement>(onClose, isOpen);

  useEffect(() => {
    if (!isOpen) return;

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }

    setGps({ status: 'loading' });
    getCurrentPosition()
      .then(({ latitude, longitude }) => setGps({ status: 'success', latitude, longitude }))
      .catch((err: Error) => setGps({ status: 'error', message: err.message }));
  }, [isOpen]);

  const handleClose = () => {
    setIsSuccessSent(false);
    setCustomNote('');
    idempotencyKeyRef.current = '';
    sendSosAlert.reset();
    onClose();
  };

  if (!isOpen) return null;

  const handleBroadcastSOS = (e: React.FormEvent) => {
    e.preventDefault();

    sendSosAlert.mutate(
      {
        incidentTypeCode: selectedIncident,
        message: customNote.trim() || undefined,
        latitude: gps.status === 'success' ? gps.latitude : null,
        longitude: gps.status === 'success' ? gps.longitude : null,
        idempotencyKey: idempotencyKeyRef.current,
      },
      {
        onSuccess: () => setIsSuccessSent(true),
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={modalRef}
        className="w-full max-w-lg space-y-5 rounded-2xl border-2 border-destructive/80 bg-card p-4 sm:p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-destructive-foreground shadow-md animate-pulse shrink-0">
              <Siren className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-destructive uppercase tracking-wide flex items-center gap-1.5">
                SOS Cứu Hộ Dọc Đường
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Hỗ trợ sự cố khẩn cấp trên cung đường trekking
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Banner */}
        {isSuccessSent ? (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-4 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white font-extrabold">
              ✓
            </div>
            <h4 className="font-extrabold text-foreground text-sm">
              Tín hiệu SOS đã được gửi tới toàn bộ thành viên!
            </h4>
            <p className="text-xs text-muted-foreground">
              Thông báo khẩn cấp đã gửi tới mọi thành viên trong nhóm. Vui lòng giữ liên lạc và bình
              tĩnh.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-1 rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        ) : (
          <>
            {/* Section 1: Broadcast SOS to Group */}
            <form
              onSubmit={handleBroadcastSOS}
              className="space-y-3.5 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5 sm:p-4"
            >
              <div className="flex items-center gap-2 text-destructive font-extrabold text-xs">
                <Megaphone className="h-4 w-4 shrink-0" />
                <span>1. PHÁT TÍN HIỆU SOS TỚI TOÀN NHÓM</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-foreground">
                  Loại sự cố đang gặp phải:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INCIDENT_TYPE_OPTIONS.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedIncident(type.id)}
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
                  <span>
                    Không lấy được vị trí — SOS vẫn gửi được, hãy mô tả rõ vị trí trong ghi chú.
                  </span>
                </div>
              )}

              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ghi chú thêm tình trạng (vd: Đau cổ chân ở chặng 2, không tự di chuyển được...)"
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-destructive"
              />

              {sendSosAlert.isError && (
                <p className="text-[11px] font-semibold text-destructive">
                  {sendSosAlert.error instanceof Error
                    ? sendSosAlert.error.message
                    : 'Gửi thất bại, vui lòng thử lại.'}
                </p>
              )}

              <button
                type="submit"
                disabled={sendSosAlert.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-destructive py-3 text-xs font-black text-destructive-foreground shadow-md hover:bg-destructive/90 transition disabled:opacity-50 cursor-pointer"
              >
                {sendSosAlert.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldAlert className="h-4 w-4" />
                )}
                PHÁT TÍN HIỆU SOS CHO CẢ NHÓM
              </button>
            </form>

            {/* Section 2: Hotlines */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneCall className="h-3.5 w-3.5 text-primary shrink-0" />
                  2. SỐ ĐIỆN THOẠI KHẨN CẤP & CỨU HỘ
                </span>
              </div>

              {leaderPhone && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3 gap-2.5">
                  <div>
                    <span className="text-[10px] font-extrabold text-primary uppercase">
                      Trưởng Nhóm Đoàn
                    </span>
                    <p className="text-xs font-bold text-foreground">
                      {leaderName} • {leaderPhone}
                    </p>
                  </div>
                  <a
                    href={`tel:${leaderPhone.replace(/\./g, '')}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-extrabold text-primary-foreground shadow-xs hover:bg-primary/90 transition self-start sm:self-auto"
                  >
                    <PhoneCall className="h-3.5 w-3.5" /> Gọi Leader
                  </a>
                </div>
              )}

              <div className="space-y-2">
                {NATIONAL_HOTLINES.map((h) => (
                  <div
                    key={h.number}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-background p-2.5 text-xs gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">{h.name}</span>
                        <span className="rounded-md bg-muted px-1.5 py-0.2 text-[9.5px] font-bold text-muted-foreground">
                          {h.badge}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground">{h.desc}</p>
                    </div>
                    <a
                      href={`tel:${h.number}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1.5 sm:py-1 text-xs font-extrabold text-destructive hover:bg-destructive/20 transition shrink-0 self-start sm:self-auto"
                    >
                      <PhoneCall className="h-3 w-3" /> {h.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Emergency Rules */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-1.5 text-[11px]">
              <span className="font-extrabold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Quy tắc an toàn khi gặp sự cố trên rừng:
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground text-[10.5px]">
                <li>
                  <strong>Giữ nguyên vị trí:</strong> Tránh tự di chuyển tiếp nếu mất phương hướng
                  hoặc chấn thương.
                </li>
                <li>
                  <strong>Tiết kiệm pin & nước:</strong> Tắt bớt ứng dụng ngầm, giữ ấm cơ thể.
                </li>
                <li>
                  <strong>Tín hiệu âm thanh:</strong> Dùng còi cứu hộ (3 tiếng ngắn liên tiếp) hoặc
                  đèn pin nhấp nháy.
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
