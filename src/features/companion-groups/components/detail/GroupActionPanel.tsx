import { CheckCircle2, Loader2, MessageSquare, Send } from 'lucide-react';
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
  acceptedMembersCount,
  hasConversation,
  isInConversation,
}: GroupActionPanelProps) {
  const [applyMessage, setApplyMessage] = useState('');

  return (
    <div className="space-y-6">
      {/* 1. Chat card */}
      <div className="rounded-2xl bg-primary p-7 text-white shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Chat Nhóm</h2>
            <p className="text-xs text-white/70 mt-1">Kết nối với thành viên trong chuyến đi</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>

        {role === 'leader' ? (
          <div className="space-y-2">
            <button
              type="button"
              onClick={onCreateGroupChat}
              disabled={!hasConversation && acceptedMembersCount < 3}
              className="w-full rounded-full bg-white py-3.5 text-xs font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.99] shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="w-full rounded-full bg-white py-3.5 text-xs font-bold text-primary transition-all hover:bg-white/90 active:scale-[0.99] shadow-sm cursor-pointer"
            >
              Vào nhóm chat
            </button>
          ) : (
            <div className="rounded-full bg-white/20 py-3.5 text-xs font-medium text-white/70 text-center shadow-sm cursor-not-allowed">
              Bạn không nằm trong nhóm chat này
            </div>
          )
        ) : (
          <div className="rounded-full bg-white/20 py-3.5 text-xs font-medium text-white/70 text-center shadow-sm cursor-not-allowed">
            Trưởng nhóm chưa tạo nhóm chat
          </div>
        )}
      </div>

      {/* Leader management actions card */}
      {role === 'leader' && onEditGroup && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-3 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Quản Lý Nhóm Ghép
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bạn có thể cập nhật thông tin giới thiệu, tên nhóm hoặc sức chứa thành viên tối đa.
          </p>
          <button
            type="button"
            onClick={onEditGroup}
            className="w-full rounded-full border border-border bg-background py-3 text-xs font-bold text-foreground hover:bg-muted transition-colors shadow-xs cursor-pointer"
          >
            Chỉnh sửa thông tin nhóm
          </button>
        </div>
      )}

      {/* 2. Role-based action card */}
      {role === 'pending' && (
        <div className="rounded-2xl bg-secondary/30 border border-secondary p-6 text-left space-y-3 shadow-sm">
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Yêu cầu đang chờ duyệt
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
            Yêu cầu gia nhập nhóm ghép của bạn đã được gửi thành công và đang chờ trưởng nhóm phê
            duyệt.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancelRequest}
              className="w-full rounded-full border border-destructive/30 bg-card py-3 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-sm cursor-pointer"
            >
              Hủy yêu cầu tham gia
            </button>
          </div>
        </div>
      )}

      {role === 'guest' && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-foreground">Gửi Đơn Tham Gia Nhóm</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Giới thiệu bản thân và kinh nghiệm trekking để trưởng nhóm dễ dàng duyệt đơn của bạn.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="apply-intro-message"
              className="block text-xs font-semibold text-foreground"
            >
              Lời nhắn gửi Trưởng nhóm (Tùy chọn)
            </label>
            <textarea
              id="apply-intro-message"
              value={applyMessage}
              onChange={(e) => setApplyMessage(e.target.value)}
              placeholder="VD: Mình đã từng leo Lảo Thẩn, thể lực tốt, muốn tham gia cùng nhóm..."
              maxLength={500}
              rows={3}
              className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex justify-end text-[11px] text-muted-foreground">
              {applyMessage.length}/500 ký tự
            </div>
          </div>

          <button
            type="button"
            disabled={isJoining || groupStatus !== 'OPEN'}
            onClick={() => onJoin(applyMessage.trim() || undefined)}
            className="w-full rounded-full bg-primary py-3.5 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
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
        <div className="rounded-2xl bg-card border border-border p-6 text-center space-y-4 shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Bạn đã là thành viên</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Bạn đã được duyệt tham gia nhóm ghép này thành công.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLeave}
            className="w-full rounded-full border border-destructive/30 bg-card py-3.5 text-xs font-bold text-destructive hover:bg-destructive/5 transition-colors shadow-sm cursor-pointer"
          >
            Rời khỏi nhóm ghép
          </button>
        </div>
      )}
    </div>
  );
}
