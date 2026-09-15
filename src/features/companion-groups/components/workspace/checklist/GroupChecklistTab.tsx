import {
  CheckCircle2,
  CheckSquare,
  Edit2,
  Flame,
  Loader2,
  Package,
  Plus,
  Square,
  Tent,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useClickOutside } from '@/shared/hooks';
import { toast } from '@/store/useToastStore';
import {
  useCreateGroupChecklistItem,
  useDeleteGroupChecklistItem,
  useGroupChecklist,
  useUpdateGroupChecklistItem,
  useUpdateGroupChecklistItemStatus,
} from '../../../hooks/useGroupChecklistWorkspace';
import type { MatchingGroupMemberResponse } from '../../../types/matchingGroup';
import type {
  GroupChecklistCategory,
  GroupChecklistItemResponse,
  GroupChecklistItemType,
  GroupChecklistStatus,
} from '../../../types/workspace';

interface GroupChecklistTabProps {
  groupId: string;
  isLeader: boolean;
  currentUserId?: string;
  members: MatchingGroupMemberResponse[];
}

const ITEM_TYPE_OPTIONS: { label: string; value: GroupChecklistItemType }[] = [
  { label: 'Lều trại & Dã ngoại', value: 'TENT' },
  { label: 'Y tế & Cấp cứu', value: 'MEDICAL' },
  { label: 'Điện tử & Đèn pin', value: 'ELECTRONICS' },
  { label: 'Trang phục & Giày dép', value: 'CLOTHING' },
  { label: 'Khác', value: 'OTHER' },
];

function getItemTypeLabel(type?: GroupChecklistItemType): string {
  if (!type) return 'Khác';
  const found = ITEM_TYPE_OPTIONS.find((opt) => opt.value === type);
  return found ? found.label : type;
}

export function GroupChecklistTab({
  groupId,
  isLeader,
  currentUserId,
  members,
}: GroupChecklistTabProps) {
  const { data: summary, isLoading, error } = useGroupChecklist(groupId);
  const createItem = useCreateGroupChecklistItem(groupId);
  const updateItem = useUpdateGroupChecklistItem(groupId);
  const updateStatus = useUpdateGroupChecklistItemStatus(groupId);
  const deleteItem = useDeleteGroupChecklistItem(groupId);

  const acceptedMembers = useMemo(() => members.filter((m) => m.status === 'ACCEPTED'), [members]);

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'PERSONAL' | 'SHARED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GroupChecklistItemResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroupChecklistItemResponse | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formScope, setFormScope] = useState<GroupChecklistCategory>('SHARED');
  const [formTypeCode, setFormTypeCode] = useState<GroupChecklistItemType>('TENT');
  const [formIsRequired, setFormIsRequired] = useState(true);
  const [formAssigneeMemberId, setFormAssigneeMemberId] = useState<string>('');
  const [formNote, setFormNote] = useState('');

  const items = summary?.items ?? [];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const scope = item.itemScope || item.category || 'SHARED';
      const isMyPersonal =
        scope === 'PERSONAL' && (!item.assigneeUserId || item.assigneeUserId === currentUserId);
      const isShared = scope === 'SHARED';

      if (activeCategory === 'PERSONAL') {
        return isMyPersonal;
      }
      if (activeCategory === 'SHARED') {
        return isShared;
      }
      // ALL: Chỉ hiện đồ dùng chung + đồ cá nhân của chính mình
      return isShared || isMyPersonal;
    });
  }, [items, activeCategory, currentUserId]);

  const visiblePersonalItems = useMemo(() => {
    return items.filter((item) => {
      const scope = item.itemScope || item.category || 'SHARED';
      return (
        scope === 'PERSONAL' && (!item.assigneeUserId || item.assigneeUserId === currentUserId)
      );
    });
  }, [items, currentUserId]);

  const visibleSharedItems = useMemo(() => {
    return items.filter((item) => {
      const scope = item.itemScope || item.category || 'SHARED';
      return scope === 'SHARED';
    });
  }, [items]);

  const totalCount = visibleSharedItems.length + visiblePersonalItems.length;
  const doneCount = [...visibleSharedItems, ...visiblePersonalItems].filter(
    (i) => i.status === 'DONE' || i.status === 'COMPLETED'
  ).length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const sharedItemsCount = visibleSharedItems.length;
  const personalItemsCount = visiblePersonalItems.length;

  const modalRef = useClickOutside<HTMLDivElement>(() => {
    if (!createItem.isPending && !updateItem.isPending) {
      setIsModalOpen(false);
    }
  }, isModalOpen);

  const deleteModalRef = useClickOutside<HTMLDivElement>(() => {
    if (!deleteItem.isPending) {
      setDeleteTarget(null);
    }
  }, Boolean(deleteTarget));

  const openCreateModal = () => {
    setEditingItem(null);
    setFormTitle('');
    // Nếu là leader thì mặc định SHARED, thành viên thường mặc định PERSONAL
    setFormScope(isLeader ? 'SHARED' : 'PERSONAL');
    setFormTypeCode('TENT');
    setFormIsRequired(true);
    setFormAssigneeMemberId(acceptedMembers[0]?.matchingMemberId ?? '');
    setFormNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GroupChecklistItemResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingItem(item);
    setFormTitle(item.title || item.itemName || '');
    setFormScope((item.itemScope || item.category || 'SHARED') as GroupChecklistCategory);
    setFormTypeCode((item.itemTypeCode || item.itemType || 'TENT') as GroupChecklistItemType);
    setFormIsRequired(item.isRequired ?? true);
    setFormAssigneeMemberId(item.assigneeMatchingMemberId || item.assigneeMemberId || '');
    setFormNote(item.note || '');
    setIsModalOpen(true);
  };

  const handleToggleStatus = (item: GroupChecklistItemResponse, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const id = item.groupChecklistItemId || item.itemId;
    if (!id) return;

    const scope = item.itemScope || item.category || 'SHARED';
    const isAssignee = Boolean(
      currentUserId &&
        (item.assigneeUserId === currentUserId ||
          (item.assigneeMatchingMemberId &&
            acceptedMembers.find((m) => m.matchingMemberId === item.assigneeMatchingMemberId)
              ?.userId === currentUserId))
    );

    // Quyền đánh dấu:
    // - Đồ cá nhân: CHỈ chính chủ nhân
    // - Đồ chung: Leader HOẶC người được phân công món đồ đó
    const canToggle = scope === 'PERSONAL' ? isAssignee : isLeader || isAssignee;

    if (!canToggle) {
      if (scope === 'PERSONAL') {
        toast.error('Bạn chỉ có thể đánh dấu đồ cá nhân của chính mình.');
      } else {
        toast.error(
          'Chỉ người được phân công hoặc Trưởng nhóm mới có quyền đánh dấu vật dụng này.'
        );
      }
      return;
    }

    const isDone = item.status === 'DONE' || item.status === 'COMPLETED';
    const nextStatus: GroupChecklistStatus = isDone ? 'TODO' : 'DONE';

    updateStatus.mutate(
      { itemId: id, payload: nextStatus },
      {
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.');
        },
      }
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Vui lòng nhập tên đồ dùng.');
      return;
    }

    if (editingItem) {
      const id = editingItem.groupChecklistItemId || editingItem.itemId;
      if (!id) return;

      updateItem.mutate(
        {
          itemId: id,
          payload: {
            title: formTitle.trim(),
            itemScope: formScope,
            itemTypeCode: formTypeCode,
            isRequired: formIsRequired,
            note: formNote.trim() || null,
            assigneeMatchingMemberId: formScope === 'SHARED' ? formAssigneeMemberId || null : null,
          },
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            toast.success('Đã cập nhật mục đồ dùng.');
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : 'Không thể cập nhật đồ dùng.');
          },
        }
      );
    } else {
      createItem.mutate(
        {
          title: formTitle.trim(),
          itemScope: formScope,
          itemTypeCode: formTypeCode,
          isRequired: formIsRequired,
          note: formNote.trim() || null,
          assigneeMatchingMemberId: formScope === 'SHARED' ? formAssigneeMemberId || null : null,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            toast.success('Đã thêm mục đồ dùng vào checklist.');
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : 'Không thể thêm đồ dùng.');
          },
        }
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const id = deleteTarget.groupChecklistItemId || deleteTarget.itemId;
    if (!id) return;

    deleteItem.mutate(id, {
      onSuccess: () => {
        setDeleteTarget(null);
        toast.success('Đã xóa mục khỏi checklist.');
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Không thể xóa mục đồ dùng.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Đang tải danh sách đồ dùng & checklist...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Không thể tải danh sách đồ dùng: {error instanceof Error ? error.message : 'Lỗi kết nối'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER STATS & PROGRESS */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-foreground">
                Checklist & Phân Công Đồ Dùng Chuyến Đi
              </h3>
              <p className="text-xs text-muted-foreground">
                Chuẩn bị sẵn sàng hành trang cá nhân và phân công vật dụng dùng chung cho cả đoàn.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm đồ dùng mới
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Tiến độ chuẩn bị chung:
            </span>
            <span className="font-extrabold text-primary">
              {doneCount}/{totalCount} món ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveCategory('ALL')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer',
              activeCategory === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            Tất cả ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('PERSONAL')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
              activeCategory === 'PERSONAL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            <User className="h-3.5 w-3.5" />
            Đồ cá nhân ({personalItemsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('SHARED')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer flex items-center gap-1.5',
              activeCategory === 'SHARED'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            )}
          >
            <Tent className="h-3.5 w-3.5" />
            Đồ dùng chung ({sharedItemsCount})
          </button>
        </div>

        <span className="text-xs text-muted-foreground italic">
          *Nhấn vào thẻ đồ dùng để đánh dấu đã chuẩn bị
        </span>
      </div>

      {/* ITEMS LIST */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center text-xs text-muted-foreground">
          Chưa có đồ dùng nào trong danh mục này. Hãy bấm <b>"Thêm đồ dùng mới"</b> để bắt đầu chuẩn
          bị hành trang!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const id = item.groupChecklistItemId || item.itemId || '';
            const title = item.title || item.itemName || '';
            const scope = item.itemScope || item.category || 'SHARED';
            const isDone = item.status === 'DONE' || item.status === 'COMPLETED';
            const assigneeName = item.assigneeFullName || item.assigneeName;
            const assigneeAvatar = item.assigneeAvatarUrl;

            const isAssignee = Boolean(
              currentUserId &&
                (item.assigneeUserId === currentUserId ||
                  (item.assigneeMatchingMemberId &&
                    acceptedMembers.find(
                      (m) => m.matchingMemberId === item.assigneeMatchingMemberId
                    )?.userId === currentUserId))
            );

            // Quyền đánh dấu:
            // - Đồ cá nhân: CHỈ chính chủ nhân
            // - Đồ chung: Leader HOẶC người được phân công
            const canToggle = scope === 'PERSONAL' ? isAssignee : isLeader || isAssignee;

            // Quyền sửa/xóa:
            // - Đồ PERSONAL: CHỈ chính chủ nhân mới sửa/xóa được
            // - Đồ SHARED: CHỈ Leader mới sửa/xóa được
            const canManage =
              scope === 'PERSONAL'
                ? !item.assigneeUserId || item.assigneeUserId === currentUserId
                : isLeader;

            return (
              <div
                key={id}
                role="button"
                tabIndex={0}
                onClick={() => handleToggleStatus(item)}
                onKeyUp={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleToggleStatus(item);
                  }
                }}
                title={
                  canToggle
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
                        onClick={(e) => openEditModal(item, e)}
                        title="Sửa đồ dùng"
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(item);
                        }}
                        title="Xóa đồ dùng"
                        className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* FOOTER */}
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
          })}
        </div>
      )}

      {/* MODAL THÊM / SỬA ĐỒ DÙNG */}
      {isModalOpen && (
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
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
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
                      <option key={m.matchingMemberId} value={m.matchingMemberId}>
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
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createItem.isPending || updateItem.isPending}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {(createItem.isPending || updateItem.isPending) && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  {editingItem ? 'Lưu Thay Đổi' : 'Thêm & Phân Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div
            ref={deleteModalRef}
            className="w-full max-w-sm rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4 animate-in fade-in zoom-in duration-200"
          >
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Xóa Mục Đồ Dùng
            </h3>
            <p className="text-xs text-muted-foreground">
              Bạn có chắc chắn muốn xóa "
              <span className="font-bold text-foreground">
                {deleteTarget.title || deleteTarget.itemName}
              </span>
              " khỏi checklist của nhóm?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteItem.isPending}
                className="rounded-xl px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteItem.isPending}
                className="rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-destructive/90 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {deleteItem.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupChecklistTab;
