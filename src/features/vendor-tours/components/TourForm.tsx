import { zodResolver } from '@hookform/resolvers/zod';
import { Bold, Info, Italic, Link2, List, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { AppImageUploadField, useImageUploadCleanup } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import type { CheckpointSubmitItem, CreateTourPayload } from '../types';
import { applyMarkdownAction, type MarkdownActionType } from './applyMarkdownAction';
import { type CheckpointDraft, CheckpointFields } from './CheckpointFields';

/** Form Tạo/Sửa chỉ hỗ trợ 3 mức độ khó (khớp đúng zod enum bên dưới). */
type FormDifficulty = 'EASY' | 'MODERATE' | 'HARD';

const DIFFICULTY_OPTIONS: Array<{ value: FormDifficulty; label: string }> = [
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Vừa' },
  { value: 'HARD', label: 'Khó' },
];

const MAX_COVER_SIZE_MB = 5;

const tourFormSchema = z
  .object({
    tourName: z.string().trim().min(1, 'Vui lòng nhập tên tour'),
    difficulty: z.enum(['EASY', 'MODERATE', 'HARD']),
    location: z.string().trim().min(1, 'Vui lòng nhập địa điểm'),
    minCapacity: z.coerce.number().int().min(1, 'Tối thiểu 1 khách'),
    maxCapacity: z.coerce.number().int().min(1, 'Tối thiểu 1 khách'),
    durationDays: z.coerce.number().int().min(1, 'Tối thiểu 1 ngày'),
    description: z.string().trim().min(1, 'Vui lòng nhập lịch trình chi tiết'),
  })
  .refine((data) => data.maxCapacity >= data.minCapacity, {
    message: 'Số khách tối đa phải lớn hơn hoặc bằng số khách tối thiểu',
    path: ['maxCapacity'],
  });

/** Giá trị sau khi zod coerce (số thật) — dùng khi submit. */
type TourFormValues = z.output<typeof tourFormSchema>;
/** Giá trị trước khi coerce (khớp kiểu input HTML) — dùng cho defaultValues/register. */
type TourFormInput = z.input<typeof tourFormSchema>;

/**
 * BE từ chối tour có checkpoint trùng tên hoặc trùng toạ độ, nên chặn sớm ở FE để user
 * không mất công submit rồi mới thấy lỗi. Thứ tự trạm (`checkpointOrder`) không cần kiểm
 * tra — form tự đánh số theo vị trí trong danh sách nên không bao giờ trùng.
 * Trả về câu lỗi đầu tiên tìm thấy, `null` nếu hợp lệ.
 */
export function findDuplicateCheckpointError(checkpoints: CheckpointDraft[]): string | null {
  const seenNames = new Set<string>();
  const seenCoordinates = new Set<string>();

  for (const [index, checkpoint] of checkpoints.entries()) {
    const name = checkpoint.name.trim();
    const nameKey = name.toLowerCase();
    if (seenNames.has(nameKey)) {
      return `Checkpoint #${index + 1}: tên "${name}" đã được dùng cho một trạm khác.`;
    }
    seenNames.add(nameKey);

    // Chỉ so sánh khi nhập ĐỦ cả vĩ độ lẫn kinh độ — thiếu 1 trong 2 thì chưa xác định được vị trí.
    const latitude = checkpoint.latitude.trim();
    const longitude = checkpoint.longitude.trim();
    if (!latitude || !longitude) continue;

    const coordinateKey = `${Number(latitude)},${Number(longitude)}`;
    if (seenCoordinates.has(coordinateKey)) {
      return `Checkpoint #${index + 1}: toạ độ (${latitude}, ${longitude}) đã trùng với một trạm khác.`;
    }
    seenCoordinates.add(coordinateKey);
  }

  return null;
}

const EMPTY_DEFAULTS: TourFormInput = {
  tourName: '',
  difficulty: 'EASY',
  location: '',
  minCapacity: 1,
  maxCapacity: 1,
  durationDays: 1,
  description: '',
};

export interface TourFormProps {
  mode: 'create' | 'edit';
  /** Giá trị có sẵn để đổ vào form khi sửa — merge lên trên `EMPTY_DEFAULTS`. */
  defaultValues?: Partial<TourFormInput>;
  /** URL ảnh bìa hiện có (màn Sửa) — hiển thị sẵn trong preview, gửi lại nếu user không đổi ảnh. */
  existingCoverImageUrl?: string;
  /** Checkpoint đã có sẵn (màn Sửa) — mỗi item mang `checkpointId` thật để PUT/DELETE đúng. */
  initialCheckpoints?: CheckpointDraft[];
  /** Đang submit ở phía component cha (gọi API tạo/sửa) — dùng để disable nút. */
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (
    payload: CreateTourPayload,
    checkpoints: CheckpointSubmitItem[],
    deletedCheckpointIds: string[]
  ) => void;
}

/** Form dùng chung cho 2 màn Tạo Tour / Sửa Tour (cả Vendor Manager lẫn Vendor Staff) — chỉ khác nhau qua prop `mode`. */
export function TourForm({
  mode,
  defaultValues,
  existingCoverImageUrl,
  initialCheckpoints,
  isSubmitting: isParentSubmitting,
  onCancel,
  onSubmit: onSubmitProp,
}: TourFormProps) {
  const isEdit = mode === 'edit';

  const [checkpoints, setCheckpoints] = useState<CheckpointDraft[]>(initialCheckpoints ?? []);
  // Checkpoint id đã tồn tại lúc mở form — dùng để tính checkpoint nào bị xóa lúc submit
  // (còn lại trong `checkpoints` thì giữ/sửa, biến mất khỏi đây thì là bị xóa).
  const originalCheckpointIdsRef = useRef(
    new Set(
      (initialCheckpoints ?? []).map((c) => c.checkpointId).filter((id): id is string => !!id)
    )
  );
  // Ảnh bìa + ảnh checkpoint đều upload ngay khi chọn, form chỉ giữ URL.
  // `coverFile` chỉ để gửi kèm part multipart — xem ghi chú "ẢNH BÌA" trong `vendorTourService.ts`.
  const imageCleanup = useImageUploadCleanup();
  const [coverImageUrl, setCoverImageUrl] = useState(existingCoverImageUrl ?? '');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TourFormInput, unknown, TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const difficulty = watch('difficulty');
  const { ref: descriptionRegisterRef, ...descriptionRegisterRest } = register('description');

  /** Chèn cú pháp markdown quanh vùng đang chọn (hoặc tại con trỏ) của ô "Lịch trình chi tiết". */
  const handleMarkdownAction = (type: MarkdownActionType) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const current = watch('description');
    const { next, selectionStart, selectionEnd } = applyMarkdownAction(
      type,
      current,
      textarea.selectionStart ?? current.length,
      textarea.selectionEnd ?? current.length
    );
    setValue('description', next, { shouldDirty: true, shouldValidate: true });
    // Đợi React commit giá trị mới vào DOM rồi mới đặt lại vị trí con trỏ.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const onSubmit = async (values: TourFormValues) => {
    const payload: CreateTourPayload = {
      tourName: values.tourName,
      description: values.description,
      difficulty: values.difficulty,
      location: values.location,
      durationDays: values.durationDays,
      minCapacity: values.minCapacity,
      maxCapacity: values.maxCapacity,
      coverImageUrl: coverImageUrl.trim() || undefined,
      // Gửi kèm cả file thô — xem ghi chú "ẢNH BÌA" trong `vendorTourService.ts`.
      coverImage: coverFile ?? undefined,
    };

    const activeCheckpoints = checkpoints.filter((checkpoint) => checkpoint.name.trim());

    const duplicateError = findDuplicateCheckpointError(activeCheckpoints);
    if (duplicateError) {
      toast.error(duplicateError);
      return;
    }

    const checkpointItems: CheckpointSubmitItem[] = [];

    for (const [index, checkpoint] of activeCheckpoints.entries()) {
      const imageUrls = checkpoint.imageUrls;

      checkpointItems.push({
        checkpointId: checkpoint.checkpointId,
        payload: {
          checkpointName: checkpoint.name.trim(),
          description: checkpoint.description.trim() || undefined,
          checkpointOrder: index + 1,
          latitude: checkpoint.latitude.trim() ? Number(checkpoint.latitude) : undefined,
          longitude: checkpoint.longitude.trim() ? Number(checkpoint.longitude) : undefined,
          altitude: checkpoint.altitude.trim() ? Number(checkpoint.altitude) : undefined,
          // BE lưu tất cả ảnh của checkpoint vào 1 cột TEXT, phân tách bởi dấu phẩy.
          checkpointImageUrl: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
        },
      });
    }

    // Checkpoint cũ nào không còn trong danh sách active (bị bấm xóa) → cần DELETE.
    const keptIds = new Set(checkpointItems.map((item) => item.checkpointId).filter(Boolean));
    const deletedCheckpointIds = [...originalCheckpointIdsRef.current].filter(
      (id) => !keptIds.has(id)
    );

    // Tour đã được gửi đi → ảnh không còn là rác nữa.
    imageCleanup.commit();
    onSubmitProp(payload, checkpointItems, deletedCheckpointIds);
  };

  /** Bỏ form giữa chừng → xóa ảnh đã lỡ upload để không rác storage. */
  const handleCancel = () => {
    imageCleanup.discard();
    onCancel();
  };

  const isSaving = isSubmitting || isUploadingImages || isParentSubmitting;
  const submitLabelSaving = isEdit ? 'Đang cập nhật tour...' : 'Đang tạo tour...';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-busy={isSaving} noValidate>
      {isSaving && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex min-w-64 flex-col items-center rounded-3xl bg-white px-8 py-7 text-center shadow-2xl">
            <Loader2 className="h-12 w-12 animate-spin text-[#0B6B4F]" aria-hidden="true" />
            <p className="mt-4 text-base font-bold text-[#06261D]">
              {isUploadingImages ? 'Đang tải hình ảnh...' : submitLabelSaving}
            </p>
            <p className="mt-1 text-sm text-[#6F7B75]">Vui lòng không đóng hoặc tải lại trang.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: '#06261D' }}>
            {isEdit ? 'Sửa Tour' : 'Tạo Tour Mới'}
          </h2>
          <p className="mt-1 text-sm font-medium" style={{ color: '#6F7B75' }}>
            {isEdit
              ? 'Cập nhật thông tin hành trình trekking bên dưới.'
              : 'Điền đầy đủ thông tin bên dưới để đăng tải hành trình trekking mới lên hệ thống.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Cột trái — 60% */}
        <div className="space-y-6 lg:col-span-3">
          <section
            className="space-y-5 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Thông tin cơ bản
            </h3>

            <div>
              <label
                htmlFor="tourName"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Tên Tour <span className="text-red-500">*</span>
              </label>
              <input
                id="tourName"
                type="text"
                {...register('tourName')}
                placeholder="Ví dụ: Chinh phục đỉnh Fansipan 3 ngày 2 đêm"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.tourName && (
                <p className="mt-1 text-xs text-red-500">{errors.tourName.message}</p>
              )}
            </div>

            <div>
              <span className="mb-1.5 block text-sm font-semibold" style={{ color: '#06261D' }}>
                Độ khó
              </span>
              <div
                className="flex rounded-xl p-1"
                style={{ backgroundColor: '#F8F6EF' }}
                role="radiogroup"
                aria-label="Độ khó"
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue('difficulty', opt.value, { shouldValidate: true })}
                    className="flex-1 rounded-lg py-2 text-sm font-semibold transition-colors"
                    style={
                      difficulty === opt.value
                        ? { backgroundColor: '#06261D', color: '#FFFFFF' }
                        : { color: '#6F7B75' }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="flex items-start gap-1.5 text-xs" style={{ color: '#6F7B75' }}>
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Giá tour được thiết lập riêng cho từng lịch khởi hành ở bước "Lịch khởi hành" sau khi
              tạo tour, không đặt giá chung cho cả tour.
            </p>

            <div>
              <label
                htmlFor="location"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <input
                id="location"
                type="text"
                {...register('location')}
                placeholder="Ví dụ: Sa Pa, Lào Cai"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>
              )}
            </div>

            {/* BE bắt buộc minCapacity/maxCapacity — không có trong thiết kế gốc nhưng
                thiếu thì không tạo được tour, nên thêm 2 ô này vào form. */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="minCapacity"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Số khách tối thiểu <span className="text-red-500">*</span>
                </label>
                <input
                  id="minCapacity"
                  type="number"
                  min={1}
                  {...register('minCapacity')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.minCapacity && (
                  <p className="mt-1 text-xs text-red-500">{errors.minCapacity.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="maxCapacity"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Số khách tối đa <span className="text-red-500">*</span>
                </label>
                <input
                  id="maxCapacity"
                  type="number"
                  min={1}
                  {...register('maxCapacity')}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.maxCapacity && (
                  <p className="mt-1 text-xs text-red-500">{errors.maxCapacity.message}</p>
                )}
              </div>
            </div>
          </section>

          <section
            className="space-y-4 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Lịch trình & Checkpoints
            </h3>
            <CheckpointFields
              checkpoints={checkpoints}
              onChange={setCheckpoints}
              imageCleanup={imageCleanup}
              onUploadingChange={setIsUploadingImages}
            />
          </section>
        </div>

        {/* Cột phải — 40% */}
        <div className="space-y-6 lg:col-span-2">
          <section
            className="space-y-4 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Thời lượng
            </h3>
            <div>
              <label
                htmlFor="durationDays"
                className="mb-1.5 block text-sm font-semibold"
                style={{ color: '#06261D' }}
              >
                Số ngày <span className="text-red-500">*</span>
              </label>
              <input
                id="durationDays"
                type="number"
                min={1}
                {...register('durationDays')}
                placeholder="Ví dụ: 3"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
              />
              {errors.durationDays && (
                <p className="mt-1 text-xs text-red-500">{errors.durationDays.message}</p>
              )}
            </div>
          </section>

          <section
            className="space-y-3 rounded-3xl bg-white p-6"
            style={{ border: '1px solid #E6E2D1' }}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Hình ảnh bìa
            </h3>
            <AppImageUploadField
              value={coverImageUrl}
              onChange={setCoverImageUrl}
              onFileSelected={setCoverFile}
              folder="tours"
              cleanup={imageCleanup}
              onUploadingChange={setIsUploadingImages}
              maxSizeMb={MAX_COVER_SIZE_MB}
              previewClassName="aspect-[3/2] w-full object-cover"
            />
            <p className="flex items-start gap-1.5 text-xs" style={{ color: '#6F7B75' }}>
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Hình ảnh đẹp sẽ giúp tour của bạn thu hút hơn. Kích thước khuyến nghị: 1200 x 800px.
              Định dạng JPG, PNG.
            </p>
          </section>
        </div>

        {/* Lịch trình chi tiết — full width */}
        <section
          className="space-y-3 rounded-3xl bg-white p-6 lg:col-span-5"
          style={{ border: '1px solid #E6E2D1' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#6F7B75' }}>
              Lịch trình chi tiết
            </h3>
            <div className="flex items-center gap-3" style={{ color: '#6F7B75' }}>
              <button
                type="button"
                onClick={() => handleMarkdownAction('bold')}
                title="In đậm"
                aria-label="In đậm"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMarkdownAction('italic')}
                title="In nghiêng"
                aria-label="In nghiêng"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMarkdownAction('list')}
                title="Danh sách"
                aria-label="Danh sách"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleMarkdownAction('link')}
                title="Chèn liên kết"
                aria-label="Chèn liên kết"
              >
                <Link2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <textarea
            {...descriptionRegisterRest}
            ref={(el) => {
              descriptionRegisterRef(el);
              descriptionRef.current = el;
            }}
            rows={8}
            placeholder="Mô tả lịch trình chi tiết từng ngày, các điểm dừng chân, dịch vụ bao gồm và lưu ý quan trọng..."
            className="w-full resize-none rounded-[20px] px-4 py-3 text-sm font-medium focus:outline-none focus:ring-1"
            style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </section>
      </div>

      <hr style={{ borderColor: '#E6E2D1' }} />

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full px-5 py-2.5 text-sm font-semibold"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #D8D3C4', color: '#06261D' }}
        >
          Quay lại danh sách
        </button>
        <button
          type="submit"
          disabled={isSaving}
          aria-busy={isSaving}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
          style={{ backgroundColor: '#06261D' }}
        >
          {isSaving ? submitLabelSaving : isEdit ? 'Lưu thay đổi' : 'Xác nhận và Lưu'}
        </button>
      </div>
    </form>
  );
}
