import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MessageSquare,
  Send,
  Settings,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';
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
  onEditGroup?: () => void;
  onHideGroup?: () => void;
  onShowGroup?: () => void;
  onCloseGroup?: () => void;
  onOpenGroup?: () => void;
  isLifecyclePending?: boolean;
  acceptedMembersCount: number;
  hasConversation?: boolean;
  isInConversation?: boolean;
}

export function GroupActionPanel({
  role,
  groupStatus,
  isJoining,
  onOpenChat,
  onJoin,
  onLeave,
  onCancelRequest,
  onCreateGroupChat,
  onEditGroup,
  onHideGroup,
  onShowGroup,
  onCloseGroup,
  onOpenGroup,
  isLifecyclePending = false,
  acceptedMembersCount,
  hasConversation,
  isInConversation,
}: GroupActionPanelProps) {
  const [applyMessage, setApplyMessage] = useState('');
  const isMemberOrLeader = role === 'leader' || role === 'member';

  const isHidden = groupStatus === 'HIDDEN';
  const isClosed = groupStatus === 'CLOSED';
  const isOpen = groupStatus === 'OPEN';
  const canToggleVisibility =
    groupStatus === 'OPEN' ||
    groupStatus === 'FULL' ||
    groupStatus === 'CLOSED' ||
    groupStatus === 'HIDDEN';
  const canToggleRecruitment = groupStatus === 'OPEN' || groupStatus === 'CLOSED';

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

      {/* Leader management actions card */}
      {role === 'leader' && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quản Lý Nhóm Ghép
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Điều chỉnh cài đặt nhóm, trạng thái tuyển thành viên và hiển thị công khai.
          </p>

          <div className="space-y-2 pt-1">
            {onEditGroup && (
              <button
                type="button"
                onClick={onEditGroup}
                disabled={isLifecyclePending}
                className="w-full rounded-full border border-border bg-background py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                Chỉnh sửa thông tin nhóm
              </button>
            )}

            {/* Lifecycle: Open / Close recruitment */}
            {canToggleRecruitment && (
              <>
                {isOpen && onCloseGroup && (
                  <button
                    type="button"
                    onClick={onCloseGroup}
                    disabled={isLifecyclePending}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/5 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Đóng tuyển thành viên</span>
                  </button>
                )}
                {isClosed && onOpenGroup && (
                  <button
                    type="button"
                    onClick={onOpenGroup}
                    disabled={isLifecyclePending}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Mở lại tuyển thành viên</span>
                  </button>
                )}
              </>
            )}

            {/* Lifecycle: Hide / Show group */}
            {canToggleVisibility && (
              <>
                {!isHidden && onHideGroup && (
                  <button
                    type="button"
                    onClick={onHideGroup}
                    disabled={isLifecyclePending}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-background py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Tạm ẩn nhóm khỏi tìm kiếm</span>
                  </button>
                )}
                {isHidden && onShowGroup && (
                  <button
                    type="button"
                    onClick={onShowGroup}
                    disabled={isLifecyclePending}
                    className="flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Hiển thị nhóm ra công khai</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
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

      {role === 'guest' && (
        <div className="rounded-2xl bg-card border border-border p-5 space-y-3.5 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">Gửi Đơn Tham Gia Nhóm</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Giới thiệu ngắn gọn để Trưởng nhóm dễ dàng xét duyệt đơn của bạn.
            </p>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="apply-intro-message"
              className="block text-xs font-semibold text-foreground"
            >
              Lời nhắn gửi Trưởng nhóm
            </label>
            <textarea
              id="apply-intro-message"
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="VD: Mình đã từng trekking nhiều lần, thể lực tốt, muốn gia nhập nhóm..."
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none leading-relaxed"
            />
            <div className="flex justify-end text-[10px] text-muted-foreground">
              {applyMessage.length}/500 ký tự
            </div>
          </div>

          <button
            type="button"
            disabled={isJoining || groupStatus !== 'OPEN'}
            onClick={() => onJoin(applyMessage.trim() || undefined)}
            className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99]"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang gửi đơn...</span>
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
                Bạn đã tham gia nhóm ghép này.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLeave}
            className="w-full rounded-full border border-destructive/30 bg-background py-2 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-xs cursor-pointer"
          >
            Rời khỏi nhóm ghép
          </button>
        </div>
      )}
    </div>
  );
}
