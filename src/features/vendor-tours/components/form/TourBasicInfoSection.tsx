import { Info } from 'lucide-react';
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { AppCurrencyInput, AppImageUploadField, type ImageUploadCleanup } from '@/shared/ui';
import { DIFFICULTY_OPTIONS, MAX_COVER_SIZE_MB } from '../../constants';
import type { TourFormInput } from '../../validations';

interface TourBasicInfoSectionProps {
  register: UseFormRegister<TourFormInput>;
  control: Control<TourFormInput, unknown>;
  errors: FieldErrors<TourFormInput>;
  setValue: UseFormSetValue<TourFormInput>;
  difficulty: string;
}

export function TourBasicInfoSection({
  register,
  control,
  errors,
  setValue,
  difficulty,
}: TourBasicInfoSectionProps) {
  return (
    <>
      {/* Basic info card */}
      <section className="space-y-5 rounded-3xl border border-border bg-card p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Thông tin cơ bản
        </h3>

        <div>
          <label htmlFor="tourName" className="mb-1.5 block text-sm font-semibold text-foreground">
            Tên Tour <span className="text-destructive">*</span>
          </label>
          <input
            id="tourName"
            type="text"
            {...register('tourName')}
            placeholder="Ví dụ: Chinh phục đỉnh Fansipan 3 ngày 2 đêm"
            className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.tourName && (
            <p className="mt-1 text-xs text-destructive">{errors.tourName.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-foreground">
              Độ khó
            </span>
            <div
              className="flex rounded-xl bg-muted/50 p-1"
              role="radiogroup"
              aria-label="Độ khó"
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('difficulty', opt.value, { shouldValidate: true })}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
                    difficulty === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="price" className="mb-1.5 block text-sm font-semibold text-foreground">
              Giá tour (VNĐ) <span className="text-destructive">*</span>
            </label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <AppCurrencyInput
                  id="price"
                  value={field.value as number | undefined}
                  onChange={field.onChange}
                  placeholder="0"
                  className="w-full rounded-xl bg-muted/50 px-4 py-2.5 pr-14 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              )}
            />
            {errors.price && (
              <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm font-semibold text-foreground">
            Địa điểm <span className="text-destructive">*</span>
          </label>
          <input
            id="location"
            type="text"
            {...register('location')}
            placeholder="Ví dụ: Sa Pa, Lào Cai"
            className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.location && (
            <p className="mt-1 text-xs text-destructive">{errors.location.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="minCapacity" className="mb-1.5 block text-sm font-semibold text-foreground">
              Số khách tối thiểu <span className="text-destructive">*</span>
            </label>
            <input
              id="minCapacity"
              type="number"
              min={1}
              {...register('minCapacity')}
              className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.minCapacity && (
              <p className="mt-1 text-xs text-destructive">{errors.minCapacity.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="maxCapacity" className="mb-1.5 block text-sm font-semibold text-foreground">
              Số khách tối đa <span className="text-destructive">*</span>
            </label>
            <input
              id="maxCapacity"
              type="number"
              min={1}
              {...register('maxCapacity')}
              className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.maxCapacity && (
              <p className="mt-1 text-xs text-destructive">{errors.maxCapacity.message}</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export function TourDurationAndCoverSection({
  register,
  errors,
  coverImageUrl,
  setCoverImageUrl,
  setCoverFile,
  imageCleanup,
  setIsUploadingImages,
}: {
  register: UseFormRegister<TourFormInput>;
  errors: FieldErrors<TourFormInput>;
  coverImageUrl: string;
  setCoverImageUrl: (url: string) => void;
  setCoverFile: (file: File | null) => void;
  imageCleanup: ImageUploadCleanup;
  setIsUploadingImages: (isUploading: boolean) => void;
}) {
  return (
    <>
      <section className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Thời lượng &amp; Quãng đường
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="durationDays" className="mb-1.5 block text-sm font-semibold text-foreground">
              Số ngày <span className="text-destructive">*</span>
            </label>
            <input
              id="durationDays"
              type="number"
              min={1}
              {...register('durationDays')}
              placeholder="Ví dụ: 3"
              className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.durationDays && (
              <p className="mt-1 text-xs text-destructive">{errors.durationDays.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="totalDistanceKm" className="mb-1.5 block text-sm font-semibold text-foreground">
              Tổng cự ly (km)
            </label>
            <input
              id="totalDistanceKm"
              type="number"
              step="0.1"
              min={0}
              {...register('totalDistanceKm')}
              placeholder="Ví dụ: 25.5"
              className="w-full rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {errors.totalDistanceKm && (
              <p className="mt-1 text-xs text-destructive">{errors.totalDistanceKm.message}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-border bg-card p-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Hình ảnh đẹp sẽ giúp tour của bạn thu hút hơn. Kích thước khuyến nghị: 1200 x 800px.
          Định dạng JPG, PNG.
        </p>
      </section>
    </>
  );
}
