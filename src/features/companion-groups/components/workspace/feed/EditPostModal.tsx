import { zodResolver } from '@hookform/resolvers/zod';
import { Edit3, Loader2, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TYPE_OPTIONS,
} from '../../../constants/workspace';
import { useUpdateGroupPost } from '../../../hooks/useGroupFeedWorkspace';
import type { GroupPostResponse, GroupPostType } from '../../../types/workspace';
import type { GroupPostFormValues } from '../../../validations/workspace.schema';
import { groupPostFormSchema } from '../../../validations/workspace.schema';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  post: GroupPostResponse | null;
  isLeader: boolean;
}

export function EditPostModal({ isOpen, onClose, groupId, post, isLeader }: EditPostModalProps) {
  const updatePostMutation = useUpdateGroupPost(groupId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GroupPostFormValues>({
    resolver: zodResolver(groupPostFormSchema),
    defaultValues: {
      postType: 'DISCUSSION',
      title: '',
      content: '',
      isPinned: false,
    },
  });

  const currentType = watch('postType');
  const titleValue = watch('title') || '';
  const contentValue = watch('content') || '';

  useEffect(() => {
    if (post && isOpen) {
      reset({
        postType: (post.postType as GroupPostType) || 'DISCUSSION',
        title: post.title || '',
        content: post.content || '',
        isPinned: Boolean(post.isPinned),
      });
    }
  }, [post, isOpen, reset]);

  if (!isOpen || !post) return null;

  const postId = post.groupPostId || post.postId || post.id || '';

  async function onSubmit(data: GroupPostFormValues) {
    if (!postId) return;

    try {
      await updatePostMutation.mutateAsync({
        postId,
        payload: {
          postType: data.postType,
          title: data.title.trim(),
          content: data.content.trim(),
        },
      });
      toast.success('Cập nhật bài viết thành công!');
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể cập nhật bài viết. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  }

  const availableTypes = POST_TYPE_OPTIONS.filter((opt) => !opt.leaderOnly || isLeader);

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Chỉnh sửa bài viết"
      className="flex max-w-xl flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Edit3 className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-foreground">Chỉnh sửa bài viết</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-5 py-4">
        {/* Post Type Selector */}
        <div>
          <label
            htmlFor="edit-post-type-selector"
            className="block text-xs font-bold text-foreground mb-1.5"
          >
            Loại bài viết
          </label>
          <div id="edit-post-type-selector" className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {availableTypes.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('postType', opt.value, { shouldValidate: true })}
                className={cn(
                  'rounded-xl border p-2 text-left text-xs font-semibold transition cursor-pointer',
                  currentType === opt.value
                    ? 'border-primary bg-primary/10 text-primary shadow-2xs font-bold'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {errors.postType && (
            <p className="mt-1 text-[11px] text-destructive">{errors.postType.message}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="edit-post-title" className="text-xs font-bold text-foreground">
              Tiêu đề bài viết
            </label>
            <span className="text-[11px] text-muted-foreground">
              {titleValue.length}/{POST_TITLE_MAX_LENGTH}
            </span>
          </div>
          <input
            id="edit-post-title"
            type="text"
            {...register('title')}
            placeholder="Nhập tiêu đề thảo luận..."
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="edit-post-content" className="text-xs font-bold text-foreground">
              Nội dung bài viết
            </label>
            <span className="text-[11px] text-muted-foreground">
              {contentValue.length}/{POST_CONTENT_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="edit-post-content"
            rows={5}
            {...register('content')}
            placeholder="Chia sẻ thông tin, kế hoạch hoặc đặt câu hỏi cho nhóm..."
            className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition resize-none"
          />
          {errors.content && (
            <p className="mt-1 text-[11px] text-destructive">{errors.content.message}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50 cursor-pointer"
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            disabled={isSubmitting || updatePostMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting || updatePostMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
