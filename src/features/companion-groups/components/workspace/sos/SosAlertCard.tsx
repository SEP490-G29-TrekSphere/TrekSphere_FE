import {
  CheckCircle2,
  Copy,
  ExternalLink,
  HeartHandshake,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { getSafeTelUri } from '@/utils/sanitize';
import { getIncidentTypeMeta } from '../../../constants/sos';
import type { SosAlertResponse } from '../../../types/sos';
import { formatRelativeTime } from '../../../utils/workspaceDate';
import { MemberAvatar } from '../../detail/MemberAvatar';
import { SosSenderEmergencyActions } from './SosSenderEmergencyActions';

interface SosAlertCardProps {
  alert: SosAlertResponse;
  canResolve: boolean;
  isSender: boolean;
  onResolve: () => void;
  isResolving: boolean;
  onRespond: () => void;
  isResponding: boolean;
  onUpdateLocation: () => void;
  isUpdatingLocation: boolean;
}

export function SosAlertCard({
  alert,
  canResolve,
  isSender,
  onResolve,
  isResolving,
  onRespond,
  isResponding,
  onUpdateLocation,
  isUpdatingLocation,
}: SosAlertCardProps) {
  const meta = getIncidentTypeMeta(alert.incidentTypeCode);
  const Icon = meta.icon;
  const safeTelUri = getSafeTelUri(alert.senderPhone);
  const safeIceTelUri = getSafeTelUri(alert.senderEmergencyContactPhone);
  const isCurrentlyResponding = alert.status === 'RESPONDING';

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
      {/* Top row: Victim profile + Incident badge + Status badge */}
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
              {isCurrentlyResponding ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300 animate-pulse">
                  <HeartHandshake className="h-3 w-3" /> Đang ứng cứu
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/15 border border-rose-600/30 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-700 dark:text-rose-300 animate-pulse">
                  <ShieldAlert className="h-3 w-3" /> Chờ hỗ trợ
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Phát tín hiệu: <strong>{formatRelativeTime(alert.createdAt)}</strong> (
              {new Date(alert.createdAt).toLocaleString('vi-VN')})
            </p>
          </div>
        </div>

        {/* Quick Phone Call Button */}
        {safeTelUri && (
          <a
            href={safeTelUri}
            className="inline-flex items-center justify-center gap-1.5 self-stretch sm:self-center rounded-xl bg-background border border-border px-3.5 py-2 sm:py-1.5 text-xs font-bold text-foreground hover:bg-muted transition shadow-2xs"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Gọi: {alert.senderPhone}
          </a>
        )}
      </div>

      {/* Responder Notification Banner */}
      {isCurrentlyResponding && alert.responderName && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-800 dark:text-amber-200">
          <UserCheck className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>{alert.responderName}</strong> đang trên đường đến hỗ trợ{' '}
            {alert.respondedAt && `(${formatRelativeTime(alert.respondedAt)})`}.
            {alert.responderPhone && ` • SĐT: ${alert.responderPhone}`}
          </span>
        </div>
      )}

      {/* ICE Emergency Contact Section */}
      {(alert.senderEmergencyContactName || alert.senderEmergencyContactPhone) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-foreground">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span>
              <strong className="text-rose-600">Người thân khẩn cấp (ICE):</strong>{' '}
              {alert.senderEmergencyContactName || 'Người thân'} •{' '}
              <span className="font-bold">
                {alert.senderEmergencyContactPhone || 'Chưa cập nhật'}
              </span>
            </span>
          </div>
          {safeIceTelUri && (
            <a
              href={safeIceTelUri}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700 transition shrink-0 self-start sm:self-auto"
            >
              Gọi người thân ICE
            </a>
          )}
        </div>
      )}

      {/* Message content */}
      {alert.message && (
        <div className="rounded-xl bg-background/80 border border-border/60 p-3 text-xs text-foreground leading-relaxed">
          <span className="font-bold text-destructive">Lời nhắn khẩn cấp: </span>
          &ldquo;{alert.message}&rdquo;
        </div>
      )}

      {/* SENDER DIRECT EMERGENCY ACTIONS (SMS & HOTLINES) */}
      {isSender && <SosSenderEmergencyActions alert={alert} meta={meta} />}

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
              href={`https://www.google.com/maps?q=${encodeURIComponent(`${alert.latitude},${alert.longitude}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-2.5 py-1 text-[11px] font-bold hover:opacity-90 transition"
            >
              <ExternalLink className="h-3 w-3 shrink-0" />
              Google Maps
            </a>

            {/* Live GPS Refresh button for Victim */}
            {isSender && (
              <button
                type="button"
                onClick={onUpdateLocation}
                disabled={isUpdatingLocation}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/50 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3 w-3 shrink-0 ${isUpdatingLocation ? 'animate-spin' : ''}`}
                />
                Cập nhật vị trí
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground italic">
              Không có dữ liệu tọa độ GPS thiết bị.
            </span>
            {isSender && (
              <button
                type="button"
                onClick={onUpdateLocation}
                disabled={isUpdatingLocation}
                className="inline-flex items-center gap-1 rounded-lg border border-primary/50 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3 w-3 shrink-0 ${isUpdatingLocation ? 'animate-spin' : ''}`}
                />
                Lấy lại vị trí GPS
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 self-stretch sm:self-center flex-wrap sm:flex-nowrap">
          {/* Respond button (I'm coming to help) */}
          {!isSender && alert.status === 'OPEN' && (
            <button
              type="button"
              onClick={onRespond}
              disabled={isResponding}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-black text-white hover:bg-amber-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isResponding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              ) : (
                <HeartHandshake className="h-3.5 w-3.5 shrink-0" />
              )}
              Tôi đang đến hỗ trợ
            </button>
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
    </div>
  );
}
