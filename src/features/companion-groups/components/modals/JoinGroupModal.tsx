import { Calendar, Compass, Loader2, Send, User, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppModalShell } from '@/shared/ui';
import { formatDate } from '@/utils/format';
import { MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH } from '../../constants';
import { useScheduleConflicts } from '../../hooks/useScheduleConflicts';
import { ScheduleConflictNotice } from '../ScheduleConflictNotice';

export interface JoinGroupModalGroupSummary {
  id: string;
  title: string;
  leaderName?: string;
  leaderAvatar?: string;
  coverImageUrl?: string;
  departureDate?: string;
  /** Ngày đi dự kiến dạng ISO — dùng để đối chiếu trùng lịch. */
  targetDate?: string;
  /** Ngày kết thúc dự kiến (hành trình tự tạo), nếu có. */
  endDate?: string | null;
  maxMembers?: number;
  currentMembers?: number;
}

export type JoinGroupModalData = JoinGroupModalGroupSummary;

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: JoinGroupModalGroupSummary | null;
  isPending: boolean;
  onSubmit: (message?: string) => void;
}

export function JoinGroupModal({
  isOpen,
  onClose,
  group,
  isPending,
  onSubmit,
}: JoinGroupModalProps) {
  const [message, setMessage] = useState('');
  const [agreedToRules, setAgreedToRules] = useState(true);
  const { findConflicts, isLoading: isCheckingSchedule } = useScheduleConflicts();

  // Reset form when modal opens with new group
  useEffect(() => {
    if (isOpen) {
      setMessage('');
      setAgreedToRules(true);
    }
  }, [isOpen]);

  const conflicts = group
    ? findConflicts({ start: group.targetDate, end: group.endDate }, group.id)
    : [];
  const hasConflict = conflicts.length > 0;
  // Chưa tải xong lịch cũ thì chưa kết luận được, khoá tạm nút gửi.
  const isSubmitBlocked = hasConflict || isCheckingSchedule;

  if (!isOpen || !group) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreedToRules || isSubmitBlocked) return;
    onSubmit(message.trim() || undefined);
  }

  const availableSlots =
    group.maxMembers !== undefined && group.currentMembers !== undefined
      ? Math.max(0, group.maxMembers - group.currentMembers)
      : null;

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Gửi yêu cầu tham gia nhóm ghép"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      {/* MODAL HEADER */}
      <div className="border-border border-b bg-primary/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-extrabold text-foreground text-base sm:text-lg">
              Gửi Đơn Tham Gia Nhóm
            </h2>
            <p className="text-muted-foreground text-xs line-clamp-1">
              Đồng hành cùng chuyến đi <strong>{group.title}</strong>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs">
        {/* GROUP SUMMARY CARD */}
        <div className="rounded-2xl border border-border bg-card p-4 space-y-2.5 shadow-2xs">
          <h4 className="font-bold text-foreground text-xs line-clamp-1">{group.title}</h4>
          <div className="grid grid-cols-2 gap-2 text-muted-foreground text-[11px]">
            {group.leaderName && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="line-clamp-1">
                  Trưởng nhóm: <strong className="text-foreground">{group.leaderName}</strong>
                </span>
              </div>
            )}
            {group.departureDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="line-clamp-1">
                  Khởi hành:{' '}
                  <strong className="text-foreground">
                    {formatDate(group.departureDate) || group.departureDate}
                  </strong>
                </span>
              </div>
            )}
            {availableSlots !== null && (
              <div className="flex items-center gap-1.5 col-span-2">
                <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  Còn trống: <strong className="text-primary font-black">{availableSlots}</strong>/
                  {group.maxMembers} thành viên
                </span>
              </div>
            )}
          </div>
        </div>

        <ScheduleConflictNotice
          conflicts={conflicts}
          hint="Hãy rút đơn hoặc rời nhóm trùng ngày trước, rồi quay lại gửi yêu cầu này."
        />

        {/* INTRO MESSAGE INPUT */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="join-group-message" className="font-bold text-foreground text-xs">
              Lời nhắn gửi Trưởng nhóm
            </label>
            <span className="text-[10px] text-muted-foreground font-medium">
              {message.length}/{MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="join-group-message"
            rows={4}
            maxLength={MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
            placeholder="VD: Mình đã từng trekking 2 lần, thể lực tốt, đã chuẩn bị đầy đủ giày và gậy leo núi..."
            className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Giới thiệu ngắn gọn kinh nghiệm trekking và trang thiết bị để Trưởng nhóm dễ dàng xét
            duyệt.
          </p>
        </div>

        {/* COMMITMENT CHECKBOX */}
        <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              disabled={isPending}
              className="mt-0.5 rounded border-input text-primary focus:ring-primary h-4 w-4"
            />
            <span className="text-[11px] text-muted-foreground leading-relaxed">
              Tôi cam kết tuân thủ quy định nhóm, tôn trọng sự điều phối của Trưởng nhóm và có trách
              nhiệm với đoàn.
            </span>
          </label>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex justify-end gap-2.5 border-border border-t pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isPending || !agreedToRules || isSubmitBlocked}
            title={
              hasConflict
                ? 'Ngày đi của nhóm trùng với một chuyến khác của bạn'
                : isCheckingSchedule
                  ? 'Đang kiểm tra lịch các chuyến bạn đã đăng ký...'
                  : undefined
            }
            className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground text-xs hover:bg-primary-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Gửi yêu cầu tham gia</span>
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
