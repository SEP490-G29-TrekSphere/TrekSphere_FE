import { zodResolver } from '@hookform/resolvers/zod';
import { Bold, Info, Italic, Link2, List, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { AppCurrencyInput, AppImageUploadField, useImageUploadCleanup } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import type { CheckpointSubmitItem, CreateTourPayload } from '../types';
import { type CheckpointDraft, CheckpointFields } from './CheckpointFields';

/** Form Tạo/Sửa chỉ hỗ trợ 3 mức độ khó (khớp đúng zod enum bên dưới). */
type FormDifficulty = 'EASY' | 'MODERATE' | 'HARD';

const DIFFICULTY_OPTIONS: Array<{ value: FormDifficulty; label: string }> = [
  { value: 'EASY', label: 'Dễ' },
  { value: 'MODERATE', label: 'Vừa' },
  { value: 'HARD', label: 'Khó' },
];

const MAX_COVER_SIZE_MB = 5;

const requiredAgeText = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập tuổi tối thiểu')
  .refine(
    (value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 100,
    'Tuổi phải là số nguyên từ 1 đến 100'
  );

function optionalAgeText(label: string, minimum: number, maximum: number) {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === '' ||
        (Number.isInteger(Number(value)) && Number(value) >= minimum && Number(value) <= maximum),
      `${label} phải là số nguyên từ ${minimum} đến ${maximum}`
    );
}

const tourFormSchema = z
  .object({
    tourName: z.string().trim().min(1, 'Vui lòng nhập tên tour'),
    difficulty: z.enum(['EASY', 'MODERATE', 'HARD']),
    basePrice: z.coerce.number().min(0, 'Giá tiền không hợp lệ'),
    location: z.string().trim().min(1, 'Vui lòng nhập địa điểm'),
    minCapacity: z.coerce.number().int().min(1, 'Tối thiểu 1 khách'),
    maxCapacity: z.coerce.number().int().min(1, 'Tối thiểu 1 khách'),
    durationDays: z.coerce.number().int().min(1, 'Tối thiểu 1 ngày'),
    totalDistanceKm: z
      .string()
      .trim()
      .refine(
        (value) => value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0),
        'Quãng đường phải là số không âm'
      ),
    highlights: z.string().trim(),
    includes: z.string().trim(),
    excludes: z.string().trim(),
    description: z.string().trim().min(1, 'Vui lòng nhập lịch trình chi tiết'),
    minAge: requiredAgeText,
    maxAge: optionalAgeText('Tuổi tối đa', 1, 100),
    fitnessLevel: z.enum(['ANY', 'BASIC', 'MODERATE', 'HIGH', 'EXTREME']),
    healthRequirements: z.string().trim(),
    restrictedMedicalConditions: z.string().trim(),
    requiredExperience: z.string().trim(),
    requiredSkills: z.string().trim(),
    requiredEquipment: z.string().trim(),
    requiredDocuments: z.string().trim(),
    requiresHealthDeclaration: z.boolean(),
    requiresMedicalCertificate: z.boolean(),
    guardianRequiredUnderAge: optionalAgeText('Tuổi cần người giám hộ', 1, 18),
    additionalRequirements: z.string().trim(),
  })
  .refine((data) => data.maxCapacity >= data.minCapacity, {
    message: 'Số khách tối đa phải lớn hơn hoặc bằng số khách tối thiểu',
    path: ['maxCapacity'],
  })
  .superRefine((data, context) => {
    if (data.maxAge !== '' && Number(data.maxAge) < Number(data.minAge)) {
      context.addIssue({
        code: 'custom',
        message: 'Tuổi tối đa phải lớn hơn hoặc bằng tuổi tối thiểu',
        path: ['maxAge'],
      });
    }
  });

/** Giá trị sau khi zod coerce (số thật) — dùng khi submit. */
export type TourFormValues = z.infer<typeof tourFormSchema>;
/** Giá trị trước khi coerce (khớp kiểu input HTML) — dùng cho defaultValues/register. */
export type TourFormInput = z.input<typeof tourFormSchema>;

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
  difficulty: 'MODERATE',
  basePrice: 0,
  location: '',
  minCapacity: 1,
  maxCapacity: 10,
  durationDays: 1,
  totalDistanceKm: '',
  highlights: '',
  includes: '',
  excludes: '',
  description: '',
  minAge: '18',
  maxAge: '',
  fitnessLevel: 'BASIC',
  healthRequirements: '',
  restrictedMedicalConditions: '',
  requiredExperience: '',
  requiredSkills: '',
  requiredEquipment: '',
  requiredDocuments: '',
  requiresHealthDeclaration: false,
  requiresMedicalCertificate: false,
  guardianRequiredUnderAge: '',
  additionalRequirements: '',
};

function optionalNumber(value: string | number | undefined | null): number | undefined {
  if (value === '' || value === undefined || value === null) return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

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

export function TourForm({
  mode,
  defaultValues,
  existingCoverImageUrl,
  initialCheckpoints = [],
  isSubmitting: isParentSubmitting,
  onCancel,
  onSubmit: onSubmitProp,
}: TourFormProps) {
  const isEdit = mode === 'edit';

  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    (existingCoverImageUrl ?? defaultValues?.tourName)
      ? (((defaultValues as Record<string, unknown>).coverImageUrl as string) ?? '')
      : ''
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [checkpoints, setCheckpoints] = useState<CheckpointDraft[]>(initialCheckpoints);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const originalCheckpointIdsRef = useRef<string[]>(
    initialCheckpoints
      .map((checkpoint) => checkpoint.checkpointId)
      .filter((id): id is string => Boolean(id))
  );

  const imageCleanup = useImageUploadCleanup();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TourFormInput, unknown, TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: { ...EMPTY_DEFAULTS, ...defaultValues },
  });

  const difficulty = watch('difficulty');

  const onSubmit = async (values: TourFormValues) => {
    const payload: CreateTourPayload = {
      tourName: values.tourName,
      description: values.description,
      difficulty: values.difficulty,
      location: values.location,
      durationDays: values.durationDays,
      basePrice: values.basePrice,
      minCapacity: values.minCapacity,
      maxCapacity: values.maxCapacity,
      totalDistanceKm: optionalNumber(values.totalDistanceKm),
      highlights: values.highlights?.trim() || undefined,
      includes: values.includes?.trim() || undefined,
      excludes: values.excludes?.trim() || undefined,
      coverImageUrl: coverImageUrl.trim() || undefined,
      coverImage: coverFile ?? undefined,
      participationPolicy: {
        minAge: Number(values.minAge),
        maxAge: optionalNumber(values.maxAge),
        fitnessLevel: values.fitnessLevel,
        healthRequirements: values.healthRequirements || undefined,
        restrictedMedicalConditions: values.restrictedMedicalConditions || undefined,
        requiredExperience: values.requiredExperience || undefined,
        requiredSkills: values.requiredSkills || undefined,
        requiredEquipment: values.requiredEquipment || undefined,
        requiredDocuments: values.requiredDocuments || undefined,
        requiresHealthDeclaration: values.requiresHealthDeclaration,
        requiresMedicalCertificate: values.requiresMedicalCertificate,
        guardianRequiredUnderAge: optionalNumber(values.guardianRequiredUnderAge),
        additionalRequirements: values.additionalRequirements || undefined,
      },
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
          checkpointImageUrl: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
        },
      });
    }

    const keptIds = new Set(checkpointItems.map((item) => item.checkpointId).filter(Boolean));
    const deletedCheckpointIds = [...originalCheckpointIdsRef.current].filter(
      (id) => !keptIds.has(id)
    );

    imageCleanup.commit();
    onSubmitProp(payload, checkpointItems, deletedCheckpointIds);
  };

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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <div>
                <label
                  htmlFor="basePrice"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Giá khởi điểm (VNĐ) <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="basePrice"
                  control={control}
                  render={({ field }) => (
                    <AppCurrencyInput
                      id="basePrice"
                      value={field.value as number | undefined}
                      onChange={field.onChange}
                      placeholder="0"
                      className="w-full rounded-xl px-4 py-2.5 pr-14 text-sm font-medium focus:outline-none focus:ring-1"
                      style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                    />
                  )}
                />
                {errors.basePrice && (
                  <p className="mt-1 text-xs text-red-500">{errors.basePrice.message}</p>
                )}
              </div>
            </div>

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
              Thời lượng & Quãng đường
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

              <div>
                <label
                  htmlFor="totalDistanceKm"
                  className="mb-1.5 block text-sm font-semibold"
                  style={{ color: '#06261D' }}
                >
                  Tổng cự ly (km)
                </label>
                <input
                  id="totalDistanceKm"
                  type="number"
                  step="0.1"
                  min={0}
                  {...register('totalDistanceKm')}
                  placeholder="Ví dụ: 25.5"
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1"
                  style={{ backgroundColor: '#F8F6EF', color: '#06261D' }}
                />
                {errors.totalDistanceKm && (
                  <p className="mt-1 text-xs text-red-500">{errors.totalDistanceKm.message}</p>
                )}
              </div>
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

        {/* Section: Điểm nổi bật & Dịch vụ — full width */}
        <section
          className="space-y-5 rounded-3xl bg-white p-6 lg:col-span-5"
          style={{ border: '1px solid #E6E2D1' }}
        >
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6F7B75]">
              Điểm nổi bật & Dịch vụ
            </h3>
            <p className="mt-1 text-xs font-medium text-[#6F7B75]">
              Thông tin chi tiết về các điểm hấp dẫn và dịch vụ tour giúp khách hàng dễ dàng đưa ra
              quyết định.
            </p>
          </div>

          <div>
            <label
              htmlFor="highlights"
              className="mb-1.5 block text-sm font-semibold text-[#06261D]"
            >
              Điểm nổi bật của tour
            </label>
            <textarea
              id="highlights"
              rows={3}
              {...register('highlights')}
              placeholder="- Ngắm biển mây bồng bềnh&#10;- Chinh phục đỉnh núi nóc nhà Đông Dương&#10;- Trải nghiệm ẩm thực người bản địa"
              className="w-full resize-none rounded-xl bg-[#F8F6EF] px-4 py-3 text-sm font-medium outline-none focus:ring-1"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="includes"
                className="mb-1.5 block text-sm font-semibold text-[#06261D]"
              >
                Dịch vụ bao gồm trong tour
              </label>
              <textarea
                id="includes"
                rows={3}
                {...register('includes')}
                placeholder="- Hướng dẫn viên và Porter bản địa&#10;- Bữa ăn và nước uống suốt hành trình&#10;- Lều trại và túi ngủ chuyên dụng&#10;- Bảo hiểm du lịch"
                className="w-full resize-none rounded-xl bg-[#F8F6EF] px-4 py-3 text-sm font-medium outline-none focus:ring-1"
              />
            </div>

            <div>
              <label
                htmlFor="excludes"
                className="mb-1.5 block text-sm font-semibold text-[#06261D]"
              >
                Dịch vụ không bao gồm
              </label>
              <textarea
                id="excludes"
                rows={3}
                {...register('excludes')}
                placeholder="- Chi phí cá nhân phát sinh ngoài chương trình&#10;- Vé máy bay/tàu xe đến điểm tập kết&#10;- Tiền tip cho HDV/Porter"
                className="w-full resize-none rounded-xl bg-[#F8F6EF] px-4 py-3 text-sm font-medium outline-none focus:ring-1"
              />
            </div>
          </div>
        </section>

        {/* Section: Điều kiện tham gia — full width */}
        <section
          className="space-y-5 rounded-3xl bg-white p-6 lg:col-span-5"
          style={{ border: '1px solid #E6E2D1' }}
        >
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6F7B75]">
              Điều kiện tham gia (Participation Policy)
            </h3>
            <p className="mt-1 text-xs font-medium text-[#6F7B75]">
              Tuổi tối thiểu là bắt buộc; các giới hạn khác chỉ nhập khi cần. Tour đầy đủ policy
              giúp đảm bảo an toàn chuyến đi.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['minAge', 'Tuổi tối thiểu *', 'tuổi', '0', '120'],
              ['maxAge', 'Tuổi tối đa', 'tuổi', '0', '120'],
              ['guardianRequiredUnderAge', 'Cần người giám hộ nếu dưới', 'tuổi', '1', '18'],
            ].map(([name, label, unit, minimum, maximum]) => {
              const fieldError = errors[name as keyof typeof errors];
              return (
                <label key={name} className="text-sm font-semibold text-[#06261D]">
                  {label}
                  <span className="relative mt-1.5 block">
                    <input
                      type="number"
                      min={minimum}
                      max={maximum}
                      step="1"
                      aria-invalid={Boolean(fieldError)}
                      {...register(name as keyof TourFormInput)}
                      className={`w-full rounded-xl border px-4 py-2.5 pr-12 text-sm font-medium outline-none focus:ring-1 ${
                        fieldError
                          ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-500'
                          : 'border-transparent bg-[#F8F6EF] focus:ring-[#06261D]'
                      }`}
                    />
                    <span
                      className={`absolute inset-y-0 right-3 flex items-center text-xs ${
                        fieldError ? 'text-red-500' : 'text-[#6F7B75]'
                      }`}
                    >
                      {unit}
                    </span>
                  </span>
                  {fieldError?.message && (
                    <span className="mt-1 block text-xs font-medium text-red-500" role="alert">
                      {String(fieldError.message)}
                    </span>
                  )}
                </label>
              );
            })}

            <label className="text-sm font-semibold text-[#06261D]">
              Thể lực yêu cầu
              <select
                {...register('fitnessLevel')}
                className="mt-1.5 w-full rounded-xl bg-[#F8F6EF] px-4 py-2.5 text-sm font-medium outline-none focus:ring-1"
              >
                <option value="ANY">Không yêu cầu đặc biệt</option>
                <option value="BASIC">Cơ bản</option>
                <option value="MODERATE">Trung bình</option>
                <option value="HIGH">Tốt</option>
                <option value="EXTREME">Rất tốt / chuyên sâu</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [
                'healthRequirements',
                'Yêu cầu sức khỏe',
                'Ví dụ: Tập cardio/chạy bộ 3km mỗi ngày trong 2 tuần trước chuyến đi',
              ],
              [
                'restrictedMedicalConditions',
                'Tình trạng sức khỏe không phù hợp',
                'Ví dụ: Bệnh tim mạch, huyết áp cao, hen suyễn nặng, động kinh',
              ],
              [
                'requiredExperience',
                'Kinh nghiệm cần có',
                'Ví dụ: Đã từng tham gia ít nhất 1 chuyến trekking có độ khó tương đương',
              ],
              [
                'requiredSkills',
                'Kỹ năng cần có',
                'Ví dụ: Kỹ năng dùng gậy leo núi, điều hòa nhịp thở dốc cao, làm việc nhóm',
              ],
              [
                'requiredEquipment',
                'Trang bị bắt buộc',
                'Ví dụ: Giày trekking bám tốt, áo khoác cản gió, đèn pin đội đầu, bình nước 1.5L',
              ],
              [
                'requiredDocuments',
                'Giấy tờ bắt buộc',
                'Ví dụ: CCCD/Hộ chiếu bản gốc còn hạn để đăng ký kiểm lâm',
              ],
            ].map(([name, label, placeholder]) => (
              <label key={name} className="text-sm font-semibold text-[#06261D]">
                {label}
                <textarea
                  rows={2}
                  placeholder={placeholder}
                  {...register(name as keyof TourFormInput)}
                  className="mt-1.5 w-full resize-none rounded-xl bg-[#F8F6EF] px-4 py-3 text-sm font-medium outline-none focus:ring-1"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-[#06261D] cursor-pointer">
              <input
                type="checkbox"
                {...register('requiresHealthDeclaration')}
                className="h-4 w-4 rounded text-[#06261D] focus:ring-[#06261D]"
              />
              Bắt buộc khai báo y tế trước khởi hành
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#06261D] cursor-pointer">
              <input
                type="checkbox"
                {...register('requiresMedicalCertificate')}
                className="h-4 w-4 rounded text-[#06261D] focus:ring-[#06261D]"
              />
              Bắt buộc nộp giấy khám sức khỏe
            </label>
          </div>

          <label className="block text-sm font-semibold text-[#06261D]">
            Quy định khác
            <textarea
              rows={2}
              {...register('additionalRequirements')}
              placeholder="Ví dụ: Không sử dụng rượu bia trong 12 giờ trước khi khởi hành, tuân thủ nguyên tắc Không để lại dấu vết (Leave No Trace)"
              className="mt-1.5 w-full resize-none rounded-xl bg-[#F8F6EF] px-4 py-3 text-sm font-medium outline-none focus:ring-1"
            />
          </label>
        </section>

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
              <Bold className="h-4 w-4" />
              <Italic className="h-4 w-4" />
              <List className="h-4 w-4" />
              <Link2 className="h-4 w-4" />
            </div>
          </div>
          <textarea
            {...register('description')}
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
