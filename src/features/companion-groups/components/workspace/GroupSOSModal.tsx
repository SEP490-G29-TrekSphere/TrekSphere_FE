import { Siren, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '@/shared/hooks';
import { getCurrentPosition } from '@/utils/geolocation';
import { useSendSosAlert } from '../../hooks/sos/useSendSosAlert';
import type { IncidentType } from '../../types/sos';
import { type GpsState, SosBroadcastForm } from './sos/modal/SosBroadcastForm';
import { SosHotlineList } from './sos/modal/SosHotlineList';
import { SosSafetyGuidelines } from './sos/modal/SosSafetyGuidelines';

interface GroupSOSModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  leaderName?: string;
  leaderPhone?: string;
}

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
            {/* Section 1: Broadcast SOS Form */}
            <SosBroadcastForm
              groupId={groupId}
              selectedIncident={selectedIncident}
              onSelectIncident={setSelectedIncident}
              customNote={customNote}
              onChangeCustomNote={setCustomNote}
              gps={gps}
              isPending={sendSosAlert.isPending}
              isError={sendSosAlert.isError}
              leaderPhone={leaderPhone}
              onSubmit={handleBroadcastSOS}
            />

            {/* Section 2: Hotlines */}
            <SosHotlineList
              leaderName={leaderName}
              leaderPhone={leaderPhone}
              gpsCoords={
                gps.status === 'success'
                  ? { latitude: gps.latitude, longitude: gps.longitude }
                  : null
              }
            />

            {/* Section 3: Emergency Rules */}
            <SosSafetyGuidelines />
          </>
        )}
      </div>
    </div>
  );
}
