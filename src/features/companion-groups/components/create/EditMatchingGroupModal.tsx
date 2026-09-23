import { zodResolver } from '@hookform/resolvers/zod';
import { AlignLeft, ImageIcon, Loader2, Save, Tag, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppImageUploadField, AppModalShell, useImageUploadCleanup } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { MATCHING_GROUP_DESCRIPTION_MAX_LENGTH } from '../../constants';
import { useUpdateMatchingGroup } from '../../hooks/useUpdateMatchingGroup';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import {
  createUpdateMatchingGroupSchema,
  type UpdateMatchingGroupFormInput,
  type UpdateMatchingGroupFormValues,
} from '../../validations';

interface EditMatchingGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: MatchingGroupDetailResponse;
}

export function EditMatchingGroupModal({ isOpen, onClose, group }: EditMatchingGroupModalProps) {
  const updateMutation = useUpdateMatchingGroup();
  const cleanup = useImageUploadCleanup();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const dynamicSchema = useMemo(
    () => createUpdateMatchingGroupSchema(group.currentSize ?? 1),
    [group.currentSize]
  );

  const form = useForm<UpdateMatchingGroupFormInput, undefined, UpdateMatchingGroupFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      groupName: group.groupName,
      description: group.description ?? '',
      maxSize: group.maxSize,
      coverImageUrl: group.coverImageUrl ?? '',
    },
  });

  if (!isOpen) return null;

  function handleClose() {
    cleanup.discard();
    onClose();
  }

  async function handleSubmit(values: UpdateMatchingGroupFormValues) {
    try {
      await updateMutation.mutateAsync({
        groupId: group.matchingGroupId,
        payload: {
          groupName: values.groupName,
          description: values.description,
          maxSize: values.maxSize,
          coverImageUrl: values.coverImageUrl || undefined,
        },
      });
      cleanup.commit();
      toast.success('Cập nhật thông tin nhóm ghép thành công!');
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Cập nhật nhóm thất bại. Vui lòng thử lại.'
      );
    }
  }

  const isPending = updateMutation.isPending;
  const description = form.watch('description') ?? '';

  return (
    <AppModalShell
      open
      onClose={handleClose}
      aria-label="Chỉnh sửa thông tin nhóm"
      className="flex max-h-[90vh] max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-muted/30 px-6 py-5">
        <h2 className="font-bold text-foreground text-xl">Chỉnh sửa thông tin nhóm</h2>
        <p className="mt-1 text-muted-foreground text-xs">
          Cập nhật tên nhóm, ảnh nền, mô tả hoặc số lượng thành viên tối đa.
        </p>
      </div>

      <form
        id="edit-matching-group-form"
        noValidate
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-5 p-6 overflow-y-auto"
      >
        <div className="space-y-1.5">
          <label
            htmlFor="edit-group-name"
            className="flex items-center gap-2 font-semibold text-foreground text-xs"
          >
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            Tên nhóm <span className="text-destructive">*</span>
          </label>
          <input
            id="edit-group-name"
            type="text"
            {...form.register('groupName')}
            disabled={isPending}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 font-medium text-foreground text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          {form.formState.errors.groupName && (
            <p className="text-destructive text-xs">{form.formState.errors.groupName.message}</p>
          )}
        </div>

        {/* Group Cover Image */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 font-semibold text-foreground text-xs">
            <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
            Ảnh nền nhóm
            <span className="font-normal text-muted-foreground text-[11px]">(Không bắt buộc)</span>
          </label>
          <Controller
            name="coverImageUrl"
            control={form.control}
            render={({ field }) => (
              <AppImageUploadField
                value={field.value || undefined}
                onChange={(url) => field.onChange(url || '')}
                cleanup={cleanup}
                folder="matching-groups/covers"
                label="Tải lên ảnh nền đại diện cho nhóm"
                previewClassName="aspect-video w-full object-cover rounded-xl"
                disabled={isPending}
                onUploadingChange={setIsUploadingImage}
              />
            )}
          />
          {form.formState.errors.coverImageUrl && (
            <p className="text-destructive text-xs">
              {form.formState.errors.coverImageUrl.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="edit-max-size"
              className="flex items-center gap-2 font-semibold text-foreground text-xs"
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Số lượng thành viên tối đa
            </label>
            <span className="text-[11px] text-muted-foreground">
              Hiện có {group.currentSize} thành viên
            </span>
          </div>
          <input
            id="edit-max-size"
            type="number"
            {...form.register('maxSize')}
            disabled={isPending}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 font-medium text-foreground text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          {form.formState.errors.maxSize && (
            <p className="text-destructive text-xs">{form.formState.errors.maxSize.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="edit-description"
              className="flex items-center gap-2 font-semibold text-foreground text-xs"
            >
              <AlignLeft className="h-3.5 w-3.5 text-muted-foreground" />
              Mô tả nhóm
            </label>
            <span className="text-[11px] text-muted-foreground">
              {description.length}/{MATCHING_GROUP_DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="edit-description"
            rows={4}
            maxLength={MATCHING_GROUP_DESCRIPTION_MAX_LENGTH}
            {...form.register('description')}
            disabled={isPending}
            placeholder="Chia sẻ thêm thông tin hoặc yêu cầu đối với thành viên..."
            className="w-full resize-none rounded-lg border border-input bg-background p-3 font-medium text-foreground text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
          />
          {form.formState.errors.description && (
            <p className="text-destructive text-xs">{form.formState.errors.description.message}</p>
          )}
        </div>
      </form>

      <div className="flex justify-end gap-3 border-border border-t bg-muted/20 px-6 py-4">
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className="rounded-lg border border-input bg-background px-4 py-2 font-medium text-muted-foreground text-xs hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          form="edit-matching-group-form"
          disabled={isPending || isUploadingImage}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2 font-medium text-primary-foreground text-xs hover:bg-primary-hover cursor-pointer disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          <span>{isPending ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
        </button>
      </div>
    </AppModalShell>
  );
}
