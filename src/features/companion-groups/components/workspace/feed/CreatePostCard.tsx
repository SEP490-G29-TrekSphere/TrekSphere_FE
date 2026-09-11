import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pin, PlusCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import {
  POST_CONTENT_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
  POST_TYPE_OPTIONS,
} from '../../../constants/workspace';
import { useCreateGroupPost } from '../../../hooks/useGroupFeedWorkspace';
import type { GroupPostFormValues } from '../../../validations/workspace.schema';
import { groupPostFormSchema } from '../../../validations/workspace.schema';
import { MemberAvatar } from '../../detail/MemberAvatar';

interface CreatePostCardProps {
  groupId: string;
  isLeader: boolean;
}

export function CreatePostCard({ groupId, isLeader }: CreatePostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const user = useAppStore((state) => state.user);
  const createPostMutation = useCreateGroupPost(groupId);

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
  const isPinned = watch('isPinned');
  const titleValue = watch('title') || '';
  const contentValue = watch('content') || '';

  const availableTypes = POST_TYPE_OPTIONS.filter((opt) => !opt.leaderOnly || isLeader);

  async function onSubmit(data: GroupPostFormValues) {
    try {
      await createPostMutation.mutateAsync({
        postType: data.postType,
        title: data.title.trim(),
        content: data.content.trim(),
        isPinned: isLeader ? Boolean(data.isPinned) : false,
      });
      toast.success(
        data.postType === 'ANNOUNCEMENT'
          ? 'Đã đăng thông báo quan trọng cho nhóm!'
          : 'Đăng bài thảo luận thành công!'
      );
      reset({
        postType: 'DISCUSSION',
        title: '',
        content: '',
        isPinned: false,
      });
      setIsExpanded(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể đăng bài viết. Vui lòng thử lại!';
      toast.error(errorMsg);
    }
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-xs transition space-y-4">
      {/* Top Header / Collapsed trigger */}
      <div className="flex items-center gap-3">
        <MemberAvatar
          fullName={user?.name || 'Tôi'}
          avatarUrl={user?.avatarUrl}
          isLeader={isLeader}
          size="md"
        />

        <div className="flex-1 min-w-0">
          {!isExpanded ? (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground hover:border-primary/40 hover:bg-muted/60 transition cursor-pointer"
            >
              <span>Bạn muốn thảo luận hay thông báo điều gì cho nhóm?</span>
              <PlusCircle className="h-4 w-4 text-primary" />
            </button>
          ) : (
            <div>
              <h4 className="text-sm font-bold text-foreground">Tạo bài viết mới</h4>
              <p className="text-xs text-muted-foreground">
                Chia sẻ ý kiến, đặt câu hỏi hoặc gửi thông báo cho các thành viên.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 border-t border-border">
          {/* Post Type Selector */}
          <div>
            <label
              htmlFor="create-post-type-selector"
              className="block text-xs font-bold text-foreground mb-1.5"
            >
              Loại bài đăng
            </label>
            <div id="create-post-type-selector" className="flex flex-wrap gap-2">
              {availableTypes.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('postType', opt.value, { shouldValidate: true })}
                  className={cn(
                    'rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer',
                    currentType === opt.value
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-2xs'
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
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="create-post-title" className="text-xs font-bold text-foreground">
                Tiêu đề
              </label>
              <span className="text-[11px] text-muted-foreground">
                {titleValue.length}/{POST_TITLE_MAX_LENGTH}
              </span>
            </div>
            <input
              id="create-post-title"
              type="text"
              {...register('title')}
              placeholder="Nhập tiêu đề thảo luận / câu hỏi..."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
            />
            {errors.title && (
              <p className="mt-1 text-[11px] text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="create-post-content" className="text-xs font-bold text-foreground">
                Nội dung chi tiết
              </label>
              <span className="text-[11px] text-muted-foreground">
                {contentValue.length}/{POST_CONTENT_MAX_LENGTH}
              </span>
            </div>
            <textarea
              id="create-post-content"
              rows={4}
              {...register('content')}
              placeholder="Nhập nội dung bài viết, chuẩn bị dụng cụ, ý kiến lộ trình..."
              className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition resize-none"
            />
            {errors.content && (
              <p className="mt-1 text-[11px] text-destructive">{errors.content.message}</p>
            )}
          </div>

          {/* Leader Pin Option */}
          {isLeader && (
            <div className="flex items-center gap-2 rounded-xl bg-primary/5 p-2.5 border border-primary/20">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setValue('isPinned', e.target.checked)}
                className="h-4 w-4 rounded-sm border-border text-primary focus:ring-primary cursor-pointer"
              />
              <label
                htmlFor="isPinned"
                className="flex items-center gap-1.5 text-xs font-bold text-foreground cursor-pointer"
              >
                <Pin className="h-3.5 w-3.5 text-primary" /> Ghim bài viết này lên đầu bảng tin
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                reset();
                setIsExpanded(false);
              }}
              disabled={isSubmitting}
              className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting || createPostMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isSubmitting || createPostMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang đăng...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Đăng bài</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
