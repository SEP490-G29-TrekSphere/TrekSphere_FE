import { Loader2, Plus, X } from 'lucide-react';
import { useClickOutside } from '@/shared/hooks';
import { ITEM_TYPE_OPTIONS } from '../../../constants';
import type { MatchingMemberItem } from '../../../types/matchingGroup';
import type {
  GroupChecklistCategory,
  GroupChecklistItemResponse,
  GroupChecklistItemType,
} from '../../../types/workspace';

interface ChecklistUpsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  isLeader: boolean;
  editingItem: GroupChecklistItemResponse | null;
  formTitle: string;
  setFormTitle: (val: string) => void;
  formScope: GroupChecklistCategory;
  setFormScope: (val: GroupChecklistCategory) => void;
  formTypeCode: GroupChecklistItemType;
  setFormTypeCode: (val: GroupChecklistItemType) => void;
  formIsRequired: boolean;
  setFormIsRequired: (val: boolean) => void;
  formAssigneeMemberId: string;
  setFormAssigneeMemberId: (val: string) => void;
  formNote: string;
  setFormNote: (val: string) => void;
  acceptedMembers: MatchingMemberItem[];
  onSubmit: (e: React.FormEvent) => void;
}

export function ChecklistUpsertModal({
  isOpen,
  onClose,
  isPending,
  isLeader,
  editingItem,
  formTitle,
  setFormTitle,
  formScope,
  setFormScope,
  formTypeCode,
  setFormTypeCode,
  formIsRequired,
  setFormIsRequired,
  formAssigneeMemberId,
  setFormAssigneeMemberId,
  formNote,
  setFormNote,
  acceptedMembers,
  onSubmit,
}: ChecklistUpsertModalProps) {
  const modalRef = useClickOutside<HTMLDivElement>(() => {
    if (!isPending) {
      onClose();
    }
  }, isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-5 animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            {editingItem ? 'Chỉnh Sửa Mục Đồ Dùng' : 'Thêm Mục Đồ Dùng Mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-foreground">
              Tên vật dụng / Trang thiết bị (*):
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Đèn bão cắm trại 50W, Túi ngủ -10 độ C..."
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Phạm vi sử dụng:</label>
              <select
                value={formScope}
                disabled={!isLeader && !editingItem}
                onChange={(e) => setFormScope(e.target.value as GroupChecklistCategory)}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLeader && <option value="SHARED">Đồ dùng chung cả đoàn</option>}
                <option value="PERSONAL">Đồ dùng cá nhân</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Phân loại:</label>
              <select
                value={formTypeCode}
                onChange={(e) => setFormTypeCode(e.target.value as GroupChecklistItemType)}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {ITEM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formScope === 'SHARED' && (
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">
                Phân công thành viên phụ trách mang:
              </label>
              <select
                value={formAssigneeMemberId}
                onChange={(e) => setFormAssigneeMemberId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">-- Chưa phân công --</option>
                {acceptedMembers.map((m) => (
                  <option key={m.matchingMemberId || m.userId} value={m.matchingMemberId || ''}>
                    {m.fullName} ({m.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isRequiredCheckbox"
              checked={formIsRequired}
              onChange={(e) => setFormIsRequired(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary cursor-pointer h-4 w-4"
            />
            <label
              htmlFor="isRequiredCheckbox"
              className="font-bold text-foreground cursor-pointer"
            >
              Mục bắt buộc phải có cho chuyến đi
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-foreground">Ghi chú / Yêu cầu kỹ thuật:</label>
            <textarea
              rows={2}
              placeholder="Ví dụ: Kiểm tra lượng pin trên 80%, nhớ mang adapter sạc..."
              value={formNote}
              onChange={(e) => setFormNote(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary-hover transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingItem ? 'Lưu Thay Đổi' : 'Thêm & Phân Công'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
