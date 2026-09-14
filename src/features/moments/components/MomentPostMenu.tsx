import { Eye, Globe, Lock, MoreVertical, ShieldAlert, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface MomentPostMenuProps {
  isAuthor: boolean;
  canModerate: boolean;
  isHidden: boolean;
  /** Nhãn hành động đổi quyền hiển thị, phụ thuộc ngữ cảnh nhóm hay cá nhân. */
  visibilityActionLabel?: string;
  /** `true` khi khoảnh khắc đang công khai — quyết định icon của mục đổi quyền hiển thị. */
  isPublic: boolean;
  onToggleVisibility?: () => void;
  onHide?: () => void;
  onUnhide?: () => void;
  onDelete?: () => void;
}

const ITEM_CLASS =
  'flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left transition';

/** Menu "..." của một bài khoảnh khắc: đổi quyền hiển thị, kiểm duyệt, xóa. */
export function MomentPostMenu({
  isAuthor,
  canModerate,
  isHidden,
  visibilityActionLabel,
  isPublic,
  onToggleVisibility,
  onHide,
  onUnhide,
  onDelete,
}: MomentPostMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const canToggleVisibility = isAuthor && Boolean(onToggleVisibility);
  const canHide = canModerate && !isHidden && Boolean(onHide);
  const canUnhide = canModerate && isHidden && Boolean(onUnhide);
  const canDelete = isAuthor && Boolean(onDelete);

  if (!canToggleVisibility && !canHide && !canUnhide && !canDelete) return null;

  const runAction = (action?: () => void) => {
    setIsOpen(false);
    action?.();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-border/60 text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
        title="Tùy chọn bài viết"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Đóng tùy chọn"
            className="fixed inset-0 z-20 cursor-default border-0 bg-transparent p-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-9 right-0 z-30 w-56 space-y-1 rounded-2xl border border-border bg-popover p-1.5 font-semibold text-xs shadow-xl">
            {canToggleVisibility && (
              <button
                type="button"
                onClick={() => runAction(onToggleVisibility)}
                className={`${ITEM_CLASS} text-foreground hover:bg-muted`}
              >
                {isPublic ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                )}
                <span>{visibilityActionLabel}</span>
              </button>
            )}

            {canHide && (
              <button
                type="button"
                onClick={() => runAction(onHide)}
                className={`${ITEM_CLASS} text-rose-600 hover:bg-rose-500/10`}
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Ẩn bài vi phạm
              </button>
            )}

            {canUnhide && (
              <button
                type="button"
                onClick={() => runAction(onUnhide)}
                className={`${ITEM_CLASS} text-emerald-600 hover:bg-emerald-500/10`}
              >
                <Eye className="h-3.5 w-3.5" /> Bỏ ẩn bài viết
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => runAction(onDelete)}
                className={`${ITEM_CLASS} border-border/40 border-t text-destructive hover:bg-destructive/10`}
              >
                <Trash2 className="h-3.5 w-3.5" /> Xóa khoảnh khắc
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
