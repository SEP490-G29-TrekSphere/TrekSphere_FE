import { CheckSquare, Edit2, Flame, Square, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getItemTypeLabel } from '../../../constants';
import type { GroupChecklistItemResponse } from '../../../types/workspace';

interface ChecklistItemCardProps {
  item: GroupChecklistItemResponse;
  currentUserId?: string;
  isLeader: boolean;
  isStatusToggleable: boolean;
  isChecklistModifiable: boolean;
  canToggle: boolean;
  canManage: boolean;
  onToggleStatus: (item: GroupChecklistItemResponse) => void;
  onEdit: (item: GroupChecklistItemResponse, e: React.MouseEvent) => void;
  onDelete: (item: GroupChecklistItemResponse) => void;
}

export function ChecklistItemCard({
  item,
  isStatusToggleable,
  canToggle,
  canManage,
  onToggleStatus,
  onEdit,
  onDelete,
}: ChecklistItemCardProps) {
  const id = item.groupChecklistItemId || item.itemId || '';
  const title = item.title || item.itemName || '';
  const scope = item.itemScope || item.category || 'SHARED';
  const isDone = item.status === 'DONE' || item.status === 'COMPLETED';
  const assigneeName = item.assigneeFullName || item.assigneeName;
  const assigneeAvatar = item.assigneeAvatarUrl;

  return (
    <div
      key={id}
      role="button"
      tabIndex={0}
      onClick={() => onToggleStatus(item)}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onToggleStatus(item);
        }
      }}
      title={
        !isStatusToggleable
          ? 'Chuyến đi đã kết thúc hoặc đã hủy'
          : canToggle
            ? 'Nhấn để chuyển trạng thái đã chuẩn bị'
            : scope === 'PERSONAL'
              ? 'Chỉ chủ nhân món đồ mới có quyền đánh dấu'
              : 'Chỉ người được phân công hoặc Trưởng nhóm mới có quyền đánh dấu'
      }
      className={cn(
        'group relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between space-y-3 select-none',
        canToggle
          ? 'cursor-pointer hover:border-primary/50 hover:shadow-sm'
          : 'cursor-default opacity-90',
        isDone ? 'border-primary/20 bg-primary/5' : 'border-border/80 bg-card'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="mt-0.5 shrink-0 text-primary">
            {isDone ? (
              <CheckSquare className="h-5 w-5 fill-primary text-white" />
            ) : (
              <Square
                className={cn(
                  'h-5 w-5 text-muted-foreground transition',
                  canToggle ? 'group-hover:text-primary' : 'opacity-40'
                )}
              />
            )}
          </span>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={cn(
                  'text-sm font-extrabold transition break-words',
                  isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                )}
              >
                {title}
              </h4>
              {item.isRequired && (
                <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-[10px] font-extrabold text-foreground">
                  Bắt buộc
                </span>
              )}
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {getItemTypeLabel(item.itemTypeCode || item.itemType)}
              </span>
            </div>

            {item.note && (
              <p className="text-xs text-muted-foreground leading-relaxed break-words">
                {item.note}
              </p>
            )}
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
            <button
              type="button"
              onClick={(e) => onEdit(item, e)}
              title="Sửa đồ dùng"
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              title="Xóa đồ dùng"
              className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
        <span className="text-muted-foreground text-[11px]">
          {scope === 'SHARED' ? (
            <span className="font-bold text-muted-foreground flex items-center gap-1">
              <Flame className="h-3 w-3 text-amber-500" /> Đồ dùng chung
            </span>
          ) : (
            <span className="font-bold text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3 text-blue-500" /> Đồ cá nhân
            </span>
          )}
        </span>

        {assigneeName ? (
          <div className="flex items-center gap-1.5 rounded-full bg-background border border-border/60 px-2.5 py-1">
            {assigneeAvatar ? (
              <img
                src={assigneeAvatar}
                alt={assigneeName}
                className="h-4 w-4 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15 text-[8px] font-extrabold text-primary">
                {assigneeName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="font-bold text-foreground text-[11px] max-w-[120px] truncate">
              {assigneeName}
            </span>
          </div>
        ) : (
          <span
            className={cn(
              'text-[11px] font-bold',
              isDone ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {isDone ? '✓ Đã sẵn sàng' : 'Chưa xếp vào balo'}
          </span>
        )}
      </div>
    </div>
  );
}
