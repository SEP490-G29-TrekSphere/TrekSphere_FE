import { Mountain } from 'lucide-react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  HIKING_BIO_MAX_LENGTH,
  HIKING_EXPERIENCE_LEVEL_OPTIONS,
  HIKING_PREFERRED_AREA_SUGGESTIONS,
  HIKING_PREFERRED_AREAS_MAX,
  HIKING_PREFERRED_DIFFICULTY_OPTIONS,
  HIKING_SKILL_SUGGESTIONS,
  HIKING_SKILLS_MAX,
  HIKING_TAG_MAX_LENGTH,
} from '@/constants';
import type { UpdateProfileFormValues } from '@/features/auth/validations/auth.schema';
import { AppTagInput } from '@/shared/ui';
import { EDIT_FIELD_CLASS, EDIT_LABEL_CLASS } from './fieldStyles';

/**
 * Nhóm "Hồ sơ leo núi" — phần thông tin công khai mà trưởng nhóm ghép nhìn thấy
 * khi duyệt đơn: kinh nghiệm, độ khó ưa thích, khu vực, kỹ năng và giới thiệu.
 * Điểm uy tín do BE chấm nên không có trong form.
 */
export function HikingProfileFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateProfileFormValues>();

  const bio = useWatch({ control, name: 'bio' }) ?? '';

  return (
    <section className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          <Mountain className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-primary">Hồ sơ leo núi</h2>
          <p className="text-xs text-muted-foreground">
            Phần này hiển thị công khai, giúp trưởng nhóm đánh giá bạn khi xét đơn tham gia.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="experienceLevel" className={EDIT_LABEL_CLASS}>
              Cấp độ kinh nghiệm
            </label>
            <select
              id="experienceLevel"
              {...register('experienceLevel')}
              className={EDIT_FIELD_CLASS}
            >
              <option value="">-- Chưa chọn --</option>
              {HIKING_EXPERIENCE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="preferredDifficulty" className={EDIT_LABEL_CLASS}>
              Độ khó ưa thích
            </label>
            <select
              id="preferredDifficulty"
              {...register('preferredDifficulty')}
              className={EDIT_FIELD_CLASS}
            >
              <option value="">-- Chưa chọn --</option>
              {HIKING_PREFERRED_DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Controller
          name="preferredAreas"
          control={control}
          render={({ field }) => (
            <div>
              <div className="flex items-center justify-between">
                <span className={EDIT_LABEL_CLASS}>Khu vực ưa thích</span>
                <span className="mb-1.5 text-xs text-muted-foreground">
                  {field.value?.length ?? 0}/{HIKING_PREFERRED_AREAS_MAX}
                </span>
              </div>
              <AppTagInput
                value={field.value ?? []}
                onChange={field.onChange}
                maxTags={HIKING_PREFERRED_AREAS_MAX}
                maxTagLength={HIKING_TAG_MAX_LENGTH}
                suggestions={HIKING_PREFERRED_AREA_SUGGESTIONS}
                placeholder="VD: Tây Bắc, Hà Giang..."
              />
              {errors.preferredAreas && (
                <p className="mt-1 text-xs text-destructive">{errors.preferredAreas.message}</p>
              )}
            </div>
          )}
        />

        <Controller
          name="skills"
          control={control}
          render={({ field }) => (
            <div>
              <div className="flex items-center justify-between">
                <span className={EDIT_LABEL_CLASS}>Kỹ năng</span>
                <span className="mb-1.5 text-xs text-muted-foreground">
                  {field.value?.length ?? 0}/{HIKING_SKILLS_MAX}
                </span>
              </div>
              <AppTagInput
                value={field.value ?? []}
                onChange={field.onChange}
                maxTags={HIKING_SKILLS_MAX}
                maxTagLength={HIKING_TAG_MAX_LENGTH}
                suggestions={HIKING_SKILL_SUGGESTIONS}
                placeholder="VD: Sơ cứu, dựng lều..."
              />
              {errors.skills && (
                <p className="mt-1 text-xs text-destructive">{errors.skills.message}</p>
              )}
            </div>
          )}
        />

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="bio" className={EDIT_LABEL_CLASS}>
              Giới thiệu bản thân
            </label>
            <span className="mb-1.5 text-xs text-muted-foreground">
              {bio.length}/{HIKING_BIO_MAX_LENGTH}
            </span>
          </div>
          <textarea
            id="bio"
            rows={5}
            maxLength={HIKING_BIO_MAX_LENGTH}
            {...register('bio')}
            placeholder="Vài dòng về kinh nghiệm, thể lực và phong cách đi của bạn..."
            className="w-full resize-none rounded-xl border border-transparent bg-muted p-3.5 text-sm font-medium leading-relaxed text-primary outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground focus:border-primary"
          />
          {errors.bio && <p className="mt-1 text-xs text-destructive">{errors.bio.message}</p>}
        </div>
      </div>
    </section>
  );
}
