import { Check, Minus } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

/** Bám sát `newPasswordRules` trong `validations/auth.schema.ts`. */
const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'Ít nhất 8 ký tự', test: (value) => value.length >= 8 },
  { id: 'uppercase', label: 'Có chữ hoa (A–Z)', test: (value) => /[A-Z]/.test(value) },
  { id: 'lowercase', label: 'Có chữ thường (a–z)', test: (value) => /[a-z]/.test(value) },
  { id: 'digit', label: 'Có chữ số (0–9)', test: (value) => /[0-9]/.test(value) },
  {
    id: 'special',
    label: 'Có ký tự đặc biệt',
    test: (value) => /[!@#$%^&*()_\-+=~`[\]{}|;:'",.<>/?]/.test(value),
  },
];

interface PasswordRequirementListProps {
  passwordFieldName?: string;
  /** Nếu truyền, thêm điều kiện "khác mật khẩu hiện tại". */
  currentPasswordFieldName?: string;
  className?: string;
}

/**
 * Danh sách điều kiện mật khẩu tự tick khi người dùng gõ — cho thấy còn thiếu
 * gì thay vì bắt họ submit rồi mới đọc lỗi.
 */
export function PasswordRequirementList({
  passwordFieldName = 'newPassword',
  currentPasswordFieldName,
  className,
}: PasswordRequirementListProps) {
  const context = useFormContext();

  if (!context) {
    throw new Error('PasswordRequirementList phải nằm trong <FormProvider>');
  }

  const password = (useWatch({ control: context.control, name: passwordFieldName }) ??
    '') as string;
  const currentPassword = (useWatch({
    control: context.control,
    name: currentPasswordFieldName ?? passwordFieldName,
    disabled: !currentPasswordFieldName,
  }) ?? '') as string;

  const rules = currentPasswordFieldName
    ? [
        ...PASSWORD_RULES,
        {
          id: 'different',
          label: 'Khác mật khẩu hiện tại',
          test: (value: string) => value.length > 0 && value !== currentPassword,
        },
      ]
    : PASSWORD_RULES;

  return (
    <ul className={cn('grid gap-x-4 gap-y-2 sm:grid-cols-2', className)}>
      {rules.map((rule) => {
        const isMet = rule.test(password);

        return (
          <li key={rule.id} className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors',
                isMet ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}
            >
              {isMet ? <Check className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
            </span>
            <span className={isMet ? 'font-medium text-foreground' : 'text-muted-foreground'}>
              {rule.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
