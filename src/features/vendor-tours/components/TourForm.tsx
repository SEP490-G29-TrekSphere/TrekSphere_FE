import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useImageUploadCleanup } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import type { CheckpointSubmitItem, CreateTourPayload } from '../types';
import { type TourFormInput, type TourFormValues, tourFormSchema } from '../validations';
import { type CheckpointDraft, CheckpointFields } from './CheckpointFields';
import {
  TourBasicInfoSection,
  TourDescriptionSection,
  TourDurationAndCoverSection,
  TourHighlightsServicesSection,
  TourRequirementsSection,
} from './form';

export type { TourFormInput, TourFormValues };

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
  price: 0,
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
  defaultValues?: Partial<TourFormInput>;
  existingCoverImageUrl?: string;
  initialCheckpoints?: CheckpointDraft[];
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
      price: values.price,
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
          <div className="flex min-w-64 flex-col items-center rounded-3xl bg-card px-8 py-7 text-center shadow-2xl">
            <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden="true" />
            <p className="mt-4 text-base font-bold text-foreground">
              {isUploadingImages ? 'Đang tải hình ảnh...' : submitLabelSaving}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Vui lòng không đóng hoặc tải lại trang.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isEdit ? 'Sửa Tour' : 'Tạo Tour Mới'}
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            {isEdit
              ? 'Cập nhật thông tin hành trình trekking bên dưới.'
              : 'Điền đầy đủ thông tin bên dưới để đăng tải hành trình trekking mới lên hệ thống.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left Column (60%) */}
        <div className="space-y-6 lg:col-span-3">
          <TourBasicInfoSection
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            difficulty={difficulty}
          />

          <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lịch trình &amp; Checkpoints
            </h3>
            <CheckpointFields
              checkpoints={checkpoints}
              onChange={setCheckpoints}
              imageCleanup={imageCleanup}
              onUploadingChange={setIsUploadingImages}
            />
          </section>
        </div>

        {/* Right Column (40%) */}
        <div className="space-y-6 lg:col-span-2">
          <TourDurationAndCoverSection
            register={register}
            errors={errors}
            coverImageUrl={coverImageUrl}
            setCoverImageUrl={setCoverImageUrl}
            setCoverFile={setCoverFile}
            imageCleanup={imageCleanup}
            setIsUploadingImages={setIsUploadingImages}
          />
        </div>

        {/* Highlights & Services — Full width */}
        <TourHighlightsServicesSection register={register} />

        {/* Participation Policy — Full width */}
        <TourRequirementsSection register={register} control={control} errors={errors} />

        {/* Detailed Itinerary — Full width */}
        <TourDescriptionSection control={control} errors={errors} />
      </div>

      <hr className="border-border" />

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Quay lại danh sách
        </button>
        <button
          type="submit"
          disabled={isSaving}
          aria-busy={isSaving}
          className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60 transition-colors"
        >
          {isSaving ? submitLabelSaving : isEdit ? 'Lưu thay đổi' : 'Xác nhận và Lưu'}
        </button>
      </div>
    </form>
  );
}
