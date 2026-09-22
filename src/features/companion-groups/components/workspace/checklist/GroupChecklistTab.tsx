import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from '@/store/useToastStore';
import {
  useCreateGroupChecklistItem,
  useDeleteGroupChecklistItem,
  useGroupChecklist,
  useUpdateGroupChecklistItem,
  useUpdateGroupChecklistItemStatus,
} from '../../../hooks/useGroupChecklistWorkspace';
import type { MatchingGroupStatus, MatchingMemberItem } from '../../../types/matchingGroup';
import type {
  GroupChecklistCategory,
  GroupChecklistItemResponse,
  GroupChecklistItemType,
  GroupChecklistStatus,
} from '../../../types/workspace';
import {
  type ChecklistCategoryFilter,
  ChecklistCategoryTabs,
  ChecklistDeleteConfirmModal,
  ChecklistHeaderProgress,
  ChecklistItemCard,
  ChecklistUpsertModal,
} from './index';

interface GroupChecklistTabProps {
  groupId: string;
  isLeader: boolean;
  currentUserId?: string;
  members: MatchingMemberItem[];
  groupStatus?: MatchingGroupStatus;
}

export function GroupChecklistTab({
  groupId,
  isLeader,
  currentUserId,
  members,
  groupStatus,
}: GroupChecklistTabProps) {
  const { data: summary, isLoading, error } = useGroupChecklist(groupId);
  const createItem = useCreateGroupChecklistItem(groupId);
  const updateItem = useUpdateGroupChecklistItem(groupId);
  const updateStatus = useUpdateGroupChecklistItemStatus(groupId);
  const deleteItem = useDeleteGroupChecklistItem(groupId);

  const isTripOngoing = groupStatus === 'IN_PROGRESS';
  const isTripEnded = groupStatus === 'COMPLETED' || groupStatus === 'CANCELLED';
  const isChecklistModifiable = !isTripOngoing && !isTripEnded;
  const isStatusToggleable = !isTripEnded;

  const acceptedMembers = useMemo(() => members.filter((m) => m.status === 'ACCEPTED'), [members]);

  const [activeCategory, setActiveCategory] = useState<ChecklistCategoryFilter>('ALL');
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

      if (activeCategory === 'PERSONAL') return isMyPersonal;
      if (activeCategory === 'SHARED') return isShared;
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
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const openCreateModal = (scope: GroupChecklistCategory = 'SHARED') => {
    setEditingItem(null);
    setFormTitle('');
    setFormScope(scope);
    setFormTypeCode('TENT');
    setFormIsRequired(true);
    setFormAssigneeMemberId('');
    setFormNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GroupChecklistItemResponse, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormTitle(item.title || item.itemName || '');
    setFormScope((item.itemScope || item.category || 'SHARED') as GroupChecklistCategory);
    setFormTypeCode((item.itemTypeCode || item.itemType || 'TENT') as GroupChecklistItemType);
    setFormIsRequired(item.isRequired ?? true);
    setFormAssigneeMemberId(item.assigneeMatchingMemberId || item.assigneeMemberId || '');
    setFormNote(item.note || '');
    setIsModalOpen(true);
  };

  const handleToggleStatus = (item: GroupChecklistItemResponse) => {
    if (!isStatusToggleable) return;
    const itemId = item.groupChecklistItemId || item.itemId;
    if (!itemId) return;

    const currentStatus = item.status;
    const isCurrentlyDone = currentStatus === 'DONE' || currentStatus === 'COMPLETED';
    const nextStatus: GroupChecklistStatus = isCurrentlyDone ? 'TODO' : 'DONE';

    updateStatus.mutate(
      { itemId, payload: nextStatus },
      {
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái checklist');
        },
      }
    );
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Vui lòng nhập tên đồ dùng');
      return;
    }

    if (editingItem) {
      const itemId = editingItem.groupChecklistItemId || editingItem.itemId;
      if (!itemId) return;

      updateItem.mutate(
        {
          itemId,
          payload: {
            title: formTitle.trim(),
            itemScope: formScope,
            itemTypeCode: formTypeCode,
            isRequired: formIsRequired,
            assigneeMatchingMemberId:
              formScope === 'SHARED' && formAssigneeMemberId ? formAssigneeMemberId : null,
            note: formNote.trim() || null,
          },
        },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật đồ dùng');
            setIsModalOpen(false);
          },
          onError: (err: unknown) => {
            toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại');
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
          assigneeMatchingMemberId:
            formScope === 'SHARED' && formAssigneeMemberId ? formAssigneeMemberId : null,
          note: formNote.trim() || null,
        },
        {
          onSuccess: () => {
            toast.success('Đã thêm đồ dùng vào checklist');
            setIsModalOpen(false);
          },
          onError: (err: unknown) => {
            toast.error(err instanceof Error ? err.message : 'Thêm thất bại');
          },
        }
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const itemId = deleteTarget.groupChecklistItemId || deleteTarget.itemId;
    if (!itemId) return;

    deleteItem.mutate(itemId, {
      onSuccess: () => {
        toast.success('Đã xóa món đồ khỏi checklist');
        setDeleteTarget(null);
      },
      onError: (err: unknown) => {
        toast.error(err instanceof Error ? err.message : 'Không thể xóa đồ dùng');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border bg-card p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Không thể tải danh sách checklist. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <ChecklistHeaderProgress
        totalCount={totalCount}
        doneCount={doneCount}
        progressPercent={percent}
        isChecklistModifiable={isChecklistModifiable}
        isTripOngoing={isTripOngoing}
        onOpenCreateModal={() => openCreateModal('SHARED')}
      />

      {/* ── CATEGORY TABS & FILTER ── */}
      <ChecklistCategoryTabs
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        totalCount={totalCount}
        personalItemsCount={visiblePersonalItems.length}
        sharedItemsCount={visibleSharedItems.length}
      />

      {/* ── LIST ITEMS ── */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground font-medium">
            {activeCategory === 'SHARED'
              ? 'Chưa có đồ dùng chung nào được lên danh sách.'
              : activeCategory === 'PERSONAL'
                ? 'Bạn chưa có đồ dùng cá nhân nào cần chuẩn bị.'
                : 'Danh sách checklist đang trống.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map((item) => {
            const scope = item.itemScope || item.category || 'SHARED';
            const isAssignedToMe = item.assigneeUserId === currentUserId;
            const canToggle =
              scope === 'PERSONAL'
                ? !item.assigneeUserId || isAssignedToMe
                : isLeader || isAssignedToMe;
            const canManage = isChecklistModifiable && (isLeader || isAssignedToMe || scope === 'PERSONAL');

            return (
              <ChecklistItemCard
                key={item.groupChecklistItemId || item.itemId}
                item={item}
                currentUserId={currentUserId}
                isLeader={isLeader}
                isStatusToggleable={isStatusToggleable}
                isChecklistModifiable={isChecklistModifiable}
                canToggle={canToggle}
                canManage={canManage}
                onToggleStatus={handleToggleStatus}
                onEdit={openEditModal}
                onDelete={(target: GroupChecklistItemResponse) => setDeleteTarget(target)}
              />
            );
          })}
        </div>
      )}

      {/* ── MODALS ── */}
      <ChecklistUpsertModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isPending={createItem.isPending || updateItem.isPending}
        isLeader={isLeader}
        editingItem={editingItem}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formScope={formScope}
        setFormScope={setFormScope}
        formTypeCode={formTypeCode}
        setFormTypeCode={setFormTypeCode}
        formIsRequired={formIsRequired}
        setFormIsRequired={setFormIsRequired}
        formAssigneeMemberId={formAssigneeMemberId}
        setFormAssigneeMemberId={setFormAssigneeMemberId}
        formNote={formNote}
        setFormNote={setFormNote}
        acceptedMembers={acceptedMembers}
        onSubmit={handleSubmitForm}
      />

      <ChecklistDeleteConfirmModal
        deleteTarget={deleteTarget}
        isPending={deleteItem.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default GroupChecklistTab;
