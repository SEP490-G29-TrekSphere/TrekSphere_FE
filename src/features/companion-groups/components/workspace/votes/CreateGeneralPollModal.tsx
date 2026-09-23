import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Vote, X } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { AppModalShell } from '@/shared/ui';
import { useCreateVote } from '../../../hooks/vote/useCreateVote';
import {
  type CreateGeneralPollFormValues,
  createGeneralPollSchema,
} from '../../../validations/vote.schema';

interface CreateGeneralPollModalProps {
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** Trả về datetime-local mặc định = hiện tại + 24 giờ, theo múi giờ local của trình duyệt. */
function defaultClosesAtLocal(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function CreateGeneralPollModal({
  groupId,
  isOpen,
  onClose,
  onSuccess,
}: CreateGeneralPollModalProps) {
  const createVote = useCreateVote(groupId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateGeneralPollFormValues>({
    resolver: zodResolver(createGeneralPollSchema),
    defaultValues: {
      title: '',
      reason: '',
      closesAt: defaultClosesAtLocal(),
      options: [
        { id: crypto.randomUUID(), value: '' },
        { id: crypto.randomUUID(), value: '' },
      ],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ muốn reset form khi isOpen đổi (mở lại modal)
  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        reason: '',
        closesAt: defaultClosesAtLocal(),
        options: [
          { id: crypto.randomUUID(), value: '' },
          { id: crypto.randomUUID(), value: '' },
        ],
      });
      createVote.reset();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = handleSubmit((data) => {
    const trimmedOptions = data.options.map((o) => o.value.trim()).filter((v) => v.length > 0);

    createVote.mutate(
      {
        title: data.title.trim(),
        reason: data.reason?.trim() || undefined,
        closesAt: new Date(data.closesAt).toISOString(),
        optionLabels: trimmedOptions,
      },
      { onSuccess: () => onSuccess?.() }
    );
  });

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Tạo bình chọn mới"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0 max-h-[90vh]"
    >
      <button
        type="button"
        onClick={onClose}
        disabled={createVote.isPending}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer disabled:opacity-50"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-primary/5 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Vote className="h-6 w-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="font-extrabold text-foreground text-base sm:text-lg">
              Tạo bình chọn mới
            </h2>
            <p className="text-muted-foreground text-xs">
              Mọi thành viên có thể xem và bỏ phiếu. Đây chỉ là bình chọn thảo luận, không ảnh hưởng
              Trưởng nhóm hay trạng thái nhóm.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
        <form onSubmit={onSubmit} className="space-y-4 p-6 text-xs">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs flex items-start gap-2.5">
            <Vote className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Bình chọn ý kiến tập thể:</span> Cuộc
              bình chọn này phục vụ việc thống nhất ý kiến (ăn uống, lịch trình, đồ đạc...). Kết quả
              không làm thay đổi vai trò hay trạng thái nhóm.
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="poll-title" className="font-bold text-foreground text-xs">
              Tiêu đề bình chọn <span className="text-destructive">*</span>
            </label>
            <input
              id="poll-title"
              type="text"
              {...register('title')}
              disabled={createVote.isPending}
              placeholder="VD: Chọn quán ăn tối nay"
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {errors.title && (
              <p className="text-[11px] font-medium text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="poll-reason" className="font-bold text-foreground text-xs">
              Ghi chú (không bắt buộc)
            </label>
            <textarea
              id="poll-reason"
              rows={2}
              {...register('reason')}
              disabled={createVote.isPending}
              placeholder="Thêm bối cảnh giúp mọi người dễ quyết định hơn..."
              className="w-full resize-none rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {errors.reason && (
              <p className="text-[11px] font-medium text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="poll-closes-at" className="font-bold text-foreground text-xs">
              Thời hạn bỏ phiếu <span className="text-destructive">*</span>
            </label>
            <input
              id="poll-closes-at"
              type="datetime-local"
              {...register('closesAt')}
              disabled={createVote.isPending}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {errors.closesAt && (
              <p className="text-[11px] font-medium text-destructive">{errors.closesAt.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-xs">
                Lựa chọn (tối thiểu 2) <span className="text-destructive">*</span>
              </span>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      {...register(`options.${index}.value` as const)}
                      disabled={createVote.isPending}
                      placeholder={`Lựa chọn ${index + 1}`}
                      className="flex-1 rounded-xl border border-input bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                    />
                    {fields.length > 2 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={createVote.isPending}
                        className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-destructive cursor-pointer disabled:opacity-50"
                        aria-label="Xoá lựa chọn"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  {errors.options?.[index]?.value && (
                    <p className="text-[10.5px] font-medium text-destructive">
                      {errors.options[index]?.value?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {errors.options && typeof errors.options.message === 'string' && (
              <p className="text-[11px] font-medium text-destructive">{errors.options.message}</p>
            )}
            {errors.options?.root && (
              <p className="text-[11px] font-medium text-destructive">
                {errors.options.root.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => append({ id: crypto.randomUUID(), value: '' })}
              disabled={createVote.isPending}
              className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-[11px] font-bold text-muted-foreground hover:border-primary hover:text-primary cursor-pointer disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm lựa chọn
            </button>
          </div>

          {createVote.isError && (
            <p className="text-[11px] font-semibold text-destructive">
              {createVote.error instanceof Error
                ? createVote.error.message
                : 'Không thể tạo bình chọn, vui lòng thử lại.'}
            </p>
          )}

          <div className="flex justify-end gap-2.5 border-border border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={createVote.isPending}
              className="rounded-full border border-border bg-background px-4 py-2 font-semibold text-foreground text-xs hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!isValid || createVote.isPending}
              className="flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground text-xs hover:bg-primary-hover transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createVote.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <Vote className="h-3.5 w-3.5" />
                  <span>Tạo bình chọn</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppModalShell>
  );
}
