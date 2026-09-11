import { Controller, useFormContext } from 'react-hook-form';
import type { UpdateProfileFormValues } from '@/features/auth/validations/auth.schema';
import { AppDatePicker } from '@/shared/ui';
import { EDIT_FIELD_CLASS, EDIT_LABEL_CLASS } from './fieldStyles';

/** Nhóm thông tin định danh: họ tên, số điện thoại, email (khoá), ngày sinh, giới tính. */
export function PersonalInfoFields({ email }: { email?: string }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<UpdateProfileFormValues>();

  return (
    <section className="rounded-2xl bg-card p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-primary">Thông tin cá nhân</h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className={EDIT_LABEL_CLASS}>
            Họ và tên
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            {...register('name')}
            className={EDIT_FIELD_CLASS}
          />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className={EDIT_LABEL_CLASS}>
            Số điện thoại
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register('phone')}
            className={EDIT_FIELD_CLASS}
          />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className={EDIT_LABEL_CLASS}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email ?? ''}
            readOnly
            disabled
            className="h-11 w-full cursor-not-allowed rounded-xl border border-transparent bg-muted px-3.5 text-sm font-semibold text-muted-foreground outline-none"
          />
          <p className="mt-1 text-xs text-muted-foreground">Email không thể thay đổi</p>
        </div>

        <div>
          <label htmlFor="dateOfBirth" className={EDIT_LABEL_CLASS}>
            Ngày sinh
          </label>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <AppDatePicker
                id="dateOfBirth"
                selected={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) => {
                  if (!date) {
                    field.onChange('');
                    return;
                  }
                  const offset = date.getTimezoneOffset();
                  const localDate = new Date(date.getTime() - offset * 60 * 1000);
                  field.onChange(localDate.toISOString().split('T')[0]);
                }}
                placeholderText="dd/mm/yyyy"
                maxDate={new Date()}
                className={EDIT_FIELD_CLASS}
              />
            )}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-xs text-destructive">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="gender" className={EDIT_LABEL_CLASS}>
            Giới tính
          </label>
          <select id="gender" {...register('gender')} className={EDIT_FIELD_CLASS}>
            <option value="">-- Chọn giới tính --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>
    </section>
  );
}
