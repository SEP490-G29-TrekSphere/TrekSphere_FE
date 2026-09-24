import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import { AppExpandableTextarea } from '@/shared/ui';
import type { TourFormInput } from '../../validations';

interface TourRequirementsSectionProps {
  register: UseFormRegister<TourFormInput>;
  control: Control<TourFormInput>;
  errors: FieldErrors<TourFormInput>;
}

export function TourRequirementsSection({
  register,
  control,
  errors,
}: TourRequirementsSectionProps) {
  return (
    <section className="space-y-5 rounded-3xl border border-border bg-card p-6 lg:col-span-5">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Điều kiện tham gia
        </h3>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Tuổi tối thiểu là bắt buộc; các giới hạn khác chỉ nhập khi cần. Tour đầy đủ policy giúp
          đảm bảo an toàn chuyến đi.
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
            <label key={name} className="text-sm font-semibold text-foreground">
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
                      ? 'border-destructive bg-destructive/10 text-destructive focus:ring-destructive'
                      : 'border-transparent bg-muted/50 text-foreground focus:ring-primary'
                  }`}
                />
                <span
                  className={`absolute inset-y-0 right-3 flex items-center text-xs ${
                    fieldError ? 'text-destructive' : 'text-muted-foreground'
                  }`}
                >
                  {unit}
                </span>
              </span>
              {fieldError?.message && (
                <span className="mt-1 block text-xs font-medium text-destructive" role="alert">
                  {String(fieldError.message)}
                </span>
              )}
            </label>
          );
        })}

        <label className="text-sm font-semibold text-foreground">
          Thể lực yêu cầu
          <select
            {...register('fitnessLevel')}
            className="mt-1.5 w-full rounded-xl bg-muted/50 px-4 py-2.5 text-sm font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
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
          <AppExpandableTextarea
            key={name}
            name={name as keyof TourFormInput}
            control={control}
            label={label}
            placeholder={placeholder}
            rows={2}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
          <input
            type="checkbox"
            {...register('requiresHealthDeclaration')}
            className="h-4 w-4 rounded text-primary focus:ring-primary"
          />
          Bắt buộc khai báo y tế trước khởi hành
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-foreground cursor-pointer">
          <input
            type="checkbox"
            {...register('requiresMedicalCertificate')}
            className="h-4 w-4 rounded text-primary focus:ring-primary"
          />
          Bắt buộc nộp giấy khám sức khỏe
        </label>
      </div>

      <AppExpandableTextarea
        name="additionalRequirements"
        control={control}
        label="Quy định khác"
        placeholder="Ví dụ: Không sử dụng rượu bia trong 12 giờ trước khi khởi hành, tuân thủ nguyên tắc Không để lại dấu vết (Leave No Trace)"
        rows={2}
      />
    </section>
  );
}
