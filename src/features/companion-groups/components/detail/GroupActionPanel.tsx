import { AlertCircle, CheckCircle2, Loader2, MessageSquare, Send, Siren } from 'lucide-react';
import type { MatchingGroupStatus } from '../../services/companionGroupService';
import type { UserRoleInGroup } from '../../types';

interface GroupActionPanelProps {
  role: UserRoleInGroup;
  groupStatus: MatchingGroupStatus;
  isJoining: boolean;
  onOpenChat: () => void;
  onJoin: (message?: string) => void;
  onLeave: () => void;
  onCancelRequest: () => void;
  onCreateGroupChat: () => void;
  onOpenSos?: () => void;
  acceptedMembersCount: number;
  hasConversation?: boolean;
  isInConversation?: boolean;
  canJoin?: boolean;
  myMembershipStatus?: string | null;
  rejectReason?: string | null;
}

/**
 * Cột hành động bên phải trang chi tiết nhóm: chat nhóm và hành động theo vai trò.
 *
 * Các thao tác quản lý vòng đời của Trưởng nhóm đã chuyển sang tab "Quản lý nhóm"
 * trong workspace (`GroupManagementPanel`) để không nằm lẫn với nội dung đọc hằng ngày.
 */

export function GroupActionPanel({
  role,
  groupStatus,
  isJoining,
  onOpenChat,
  onJoin,
  onLeave,
  onCancelRequest,
  onCreateGroupChat,
  onOpenSos,
  acceptedMembersCount,
  hasConversation,
  isInConversation,
  canJoin = true,
  myMembershipStatus,
  rejectReason,
}: GroupActionPanelProps) {
  const isMemberOrLeader = role === 'leader' || role === 'member';
  const canSendSos = isMemberOrLeader && groupStatus === 'IN_PROGRESS' && Boolean(onOpenSos);

  return (
    <div className="space-y-4">
      {/* 1. Chat card: Only for Leader or Member */}
      {isMemberOrLeader && (
        <div className="rounded-2xl bg-primary p-5 text-white shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Chat Nhóm</h2>
              <p className="text-xs text-white/70 mt-0.5">Kết nối với thành viên trong chuyến đi</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>

          {role === 'leader' ? (
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={onCreateGroupChat}
                disabled={!hasConversation && acceptedMembersCount < 3}
                className="w-full rounded-full bg-white py-2.5 text-xs font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.99] shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasConversation
                  ? 'Vào nhóm chat'
                  : acceptedMembersCount >= 3
                    ? 'Tạo / Vào nhóm chat'
                    : 'Cần ít nhất 3 thành viên'}
              </button>
              {!hasConversation && acceptedMembersCount < 3 && (
                <p className="text-[10px] text-white/80 text-center leading-tight">
                  (Chỉ có thể tạo nhóm chat chung khi có từ 3 người trở lên)
                </p>
              )}
            </div>
          ) : hasConversation ? (
            isInConversation ? (
              <button
                type="button"
                onClick={onOpenChat}
                className="w-full rounded-full bg-white py-2.5 text-xs font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.99] shadow-xs cursor-pointer"
              >
                Vào nhóm chat
              </button>
            ) : (
              <div className="rounded-full bg-white/20 py-2.5 text-xs font-medium text-white/70 text-center shadow-xs cursor-not-allowed">
                Bạn không nằm trong nhóm chat này
              </div>
            )
          ) : (
            <div className="rounded-full bg-white/20 py-2.5 text-xs font-medium text-white/70 text-center shadow-xs cursor-not-allowed">
              Trưởng nhóm chưa tạo nhóm chat
            </div>
          )}
        </div>
      )}

      {/* SOS card: Leader hoặc Member, chỉ hiện khi chuyến đi đang IN_PROGRESS */}
      {canSendSos && (
        <button
          type="button"
          onClick={onOpenSos}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-destructive py-3 text-xs font-black text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors cursor-pointer animate-pulse"
        >
          <Siren className="h-4 w-4" />
          <span>Gửi tín hiệu SOS</span>
        </button>
      )}

      {/* 2. Role-based action card */}
      {role === 'pending' && (
        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-5 text-left space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            Yêu cầu đang chờ duyệt
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Yêu cầu gia nhập nhóm ghép của bạn đã được gửi và đang chờ Trưởng nhóm xem xét.
          </p>
          <button
            type="button"
            onClick={onCancelRequest}
            className="w-full rounded-full border border-destructive/30 bg-background py-2.5 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-xs cursor-pointer"
          >
            Hủy yêu cầu tham gia
          </button>
        </div>
      )}

      {groupStatus === 'CANCELLED' && role === 'guest' && (
        <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-5 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase">
            <AlertCircle className="h-4 w-4" />
            <span>Nhóm đã bị hủy</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nhóm ghép này đã giải tán, không nhận đơn xin gia nhập mới.
          </p>
        </div>
      )}

      {groupStatus !== 'CANCELLED' && role === 'guest' && myMembershipStatus === 'REJECTED' && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive mt-0.5">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-destructive">
                Đơn tham gia trước đó bị từ chối
              </h3>
              {rejectReason ? (
                <div className="text-xs text-foreground/90 space-y-0.5">
                  <span className="font-semibold text-destructive text-[11px] block">
                    Lý do từ chối:
                  </span>
                  <p className="rounded-lg bg-background/80 border border-destructive/20 p-2.5 leading-relaxed italic text-destructive">
                    "{rejectReason}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Trưởng nhóm đã từ chối yêu cầu tham gia của bạn.
                </p>
              )}
            </div>
          </div>

          {canJoin && groupStatus === 'OPEN' && (
            <button
              type="button"
              disabled={isJoining}
              onClick={() => onJoin()}
              className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Nộp lại đơn tham gia</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {groupStatus !== 'CANCELLED' &&
        role === 'guest' &&
        myMembershipStatus !== 'REJECTED' &&
        canJoin && (
          <div className="rounded-2xl bg-card border border-border p-5 space-y-3.5 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-foreground">Gửi Đơn Tham Gia Nhóm</h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Hãy gửi lời giới thiệu về thể lực và kinh nghiệm để Trưởng nhóm xét duyệt.
              </p>
            </div>

            <button
              type="button"
              disabled={isJoining || groupStatus !== 'OPEN'}
              onClick={() => onJoin()}
              className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : groupStatus === 'OPEN' ? (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi đơn tham gia</span>
                </>
              ) : (
                <span>Đã đủ thành viên</span>
              )}
            </button>
          </div>
        )}

      {role === 'member' && (
        <div className="rounded-2xl bg-card border border-border p-5 text-center space-y-3 shadow-xs">
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground">Bạn đã là thành viên</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {groupStatus === 'CANCELLED'
                  ? 'Nhóm ghép này đã giải tán.'
                  : 'Bạn đã tham gia nhóm ghép này.'}
              </p>
            </div>
          </div>
          {groupStatus !== 'CANCELLED' && (
            <button
              type="button"
              onClick={onLeave}
              className="w-full rounded-full border border-destructive/30 bg-background py-2 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-xs cursor-pointer"
            >
              Rời khỏi nhóm ghép
            </button>
          )}
        </div>
      )}
    </div>
  );
}
