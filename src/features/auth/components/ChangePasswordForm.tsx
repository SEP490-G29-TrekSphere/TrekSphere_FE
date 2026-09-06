import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { AppButton, AppFormPasswordInput, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { authService } from '../services/authService';
import { type ChangePasswordFormValues, changePasswordSchema } from '../validations/auth.schema';
import { PasswordRequirementList } from './PasswordRequirementList';
import { PasswordStrengthField } from './PasswordStrengthField';

const FIELD_INPUT =
  'h-12 w-full rounded-xl border border-input bg-background px-4 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20';

interface ChangePasswordFormProps {
  className?: string;
  /** Gọi sau khi đổi mật khẩu thành công (vd: điều hướng về trang hồ sơ). */
  onSuccess?: () => void;
}

/**
 * Form đổi mật khẩu dùng chung cho trang công khai (`/change-password`) và
 * trang trong portal trekker — cùng một logic, cùng một giao diện.
 */
export function ChangePasswordForm({ className, onSuccess }: ChangePasswordFormProps) {
  const methods = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const user = useAppStore((state) => state.user);
  const userInputs = useMemo(() => {
    const inputs: string[] = [];
    if (user?.name) inputs.push(user.name);
    if (user?.email) inputs.push(user.email);
    return inputs;
  }, [user]);

  const onSubmit = async (data: ChangePasswordFormValues) => {
    const result = await authService.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (result.error || (result.status && result.status >= 400)) {
      toast.error(result.error || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
      return;
    }

    toast.success('Đổi mật khẩu thành công!');
    methods.reset();
    onSuccess?.();
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className={cn(
          'overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
          className
        )}
      >
        <header className="flex items-start gap-4 border-b border-border bg-muted/30 px-5 py-5 sm:px-6">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/50 text-primary">
            <KeyRound className="size-6" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-foreground">Đổi mật khẩu</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Nhập mật khẩu hiện tại và chọn một mật khẩu mới đủ mạnh để bảo vệ tài khoản.
            </p>
          </div>
        </header>

        <div className="space-y-6 px-5 py-6 sm:px-6">
          <AppFormPasswordInput
            name="currentPassword"
            control={methods.control}
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            autoComplete="current-password"
            inputClassName={FIELD_INPUT}
          />

          <div className="space-y-3">
            <AppFormPasswordInput
              name="newPassword"
              control={methods.control}
              label="Mật khẩu mới"
              placeholder="Nhập mật khẩu mới"
              autoComplete="new-password"
              inputClassName={FIELD_INPUT}
            />

            <PasswordStrengthField
              passwordFieldName="newPassword"
              additionalUserInputs={userInputs}
            />

            <div className="rounded-xl border border-dashed border-border bg-muted/25 p-3.5">
              <p className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                <ShieldCheck className="h-3.5 w-3.5" />
                Yêu cầu mật khẩu
              </p>
              <PasswordRequirementList currentPasswordFieldName="currentPassword" />
            </div>
          </div>

          <AppFormPasswordInput
            name="confirmPassword"
            control={methods.control}
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            inputClassName={FIELD_INPUT}
          />
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={() => methods.reset()}
            disabled={isSubmitting}
            className="h-11 cursor-pointer rounded-full border border-border px-6 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            Đặt lại
          </button>
          <AppButton
            type="submit"
            disabled={isSubmitting}
            className="h-11 rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            {isSubmitting ? (
              <>
                <AppSpinner size="sm" className="text-primary-foreground" />
                Đang lưu...
              </>
            ) : (
              'Lưu mật khẩu'
            )}
          </AppButton>
        </footer>
      </form>
    </FormProvider>
  );
}
