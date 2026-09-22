import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { AppInput, type AppInputProps } from '@/shared/ui/primitives/AppInput';
import { AppLabel } from '@/shared/ui/primitives/AppLabel';

const PASSWORD_INPUT_CLASSES =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
// Note: native password reveal buttons (Edge/IE ::-ms-reveal, ::-ms-clear)
// are hidden globally in src/assets/css/global.css so only the custom
// toggle button rendered by this component is visible.

export interface AppFormPasswordInputProps<TFieldValues extends FieldValues>
  extends Omit<AppInputProps, 'name' | 'type'> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: React.ReactNode;
  helperText?: string;

  inputClassName?: string;

  containerClassName?: string;
}

export const AppFormPasswordInput = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  helperText,
  id,
  className,
  inputClassName,
  containerClassName,
  ...props
}: AppFormPasswordInputProps<TFieldValues>) => {
  const inputId = id || name;
  const [visible, setVisible] = React.useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <div className={cn('space-y-2', containerClassName)}>
          {label && (
            <AppLabel htmlFor={inputId} className={error ? 'text-destructive' : ''}>
              {label}
            </AppLabel>
          )}

          <div className="relative">
            <AppInput
              id={inputId}
              ref={ref}
              type={visible ? 'text' : 'password'}
              value={value || ''}
              onChange={onChange}
              onBlur={onBlur}
              aria-invalid={!!error}
              className={cn(
                inputClassName ?? PASSWORD_INPUT_CLASSES,
                !inputClassName && error ? 'border-destructive focus-visible:ring-destructive' : '',
                className
              )}
              {...props}
            />
            <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible((v) => !v)} />
          </div>

          {(error?.message || helperText) && (
            <p className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
              {error?.message || helperText}
            </p>
          )}
        </div>
      )}
    />
  );
};

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

export interface AppPasswordInputProps extends Omit<AppInputProps, 'type'> {
  label?: React.ReactNode;
  helperText?: string;
  error?: string;
  inputClassName?: string;
  containerClassName?: string;
}

export const AppPasswordInput = React.forwardRef<HTMLInputElement, AppPasswordInputProps>(
  (
    { label, helperText, error, id, className, inputClassName, containerClassName, ...props },
    ref
  ) => {
    const inputId = id || props.name || 'password';
    const [visible, setVisible] = React.useState(false);

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {label && (
          <AppLabel htmlFor={inputId} className={error ? 'text-destructive' : ''}>
            {label}
          </AppLabel>
        )}

        <div className="relative">
          <AppInput
            id={inputId}
            ref={ref}
            type={visible ? 'text' : 'password'}
            aria-invalid={!!error}
            className={cn(
              inputClassName ?? PASSWORD_INPUT_CLASSES,
              !inputClassName && error ? 'border-destructive focus-visible:ring-destructive' : '',
              className
            )}
            {...props}
          />
          <PasswordVisibilityToggle visible={visible} onToggle={() => setVisible((v) => !v)} />
        </div>

        {(error || helperText) && (
          <p className={cn('text-xs', error ? 'text-destructive' : 'text-muted-foreground')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);
AppPasswordInput.displayName = 'AppPasswordInput';

// ---------------------------------------------------------------------------
// Internal: shared toggle button
// ---------------------------------------------------------------------------

interface PasswordVisibilityToggleProps {
  visible: boolean;
  onToggle: () => void;
}

function PasswordVisibilityToggle({ visible, onToggle }: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      aria-pressed={visible}
      onClick={onToggle}
      className={cn(
        'absolute top-1/2 right-1 flex h-9 w-9 -translate-y-1/2 items-center justify-center',
        'text-muted-foreground hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
        'transition-colors cursor-pointer'
      )}
    >
      {visible ? (
        <EyeOff className="size-4" aria-hidden="true" />
      ) : (
        <Eye className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
