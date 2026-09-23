import { Banknote } from 'lucide-react';
import * as React from 'react';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { AppLabel } from '@/shared/ui/primitives/AppLabel';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/format';

export interface AppCurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number | string | null;
  onChange?: (value: number | undefined) => void;
  showIcon?: boolean;
  suffix?: string;
  allowZero?: boolean;
}

/**
 * Standardized Vietnamese Currency Input component across TrekSphere.
 * Formats values with thousand separators (e.g., 500.000, 1.500.000).
 */
export const AppCurrencyInput = React.forwardRef<HTMLInputElement, AppCurrencyInputProps>(
  (
    {
      value,
      onChange,
      showIcon = true,
      suffix = 'VNĐ',
      allowZero = true,
      placeholder = 'VD: 500.000',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [displayVal, setDisplayVal] = React.useState<string>(() => formatCurrencyInput(value));

    React.useEffect(() => {
      setDisplayVal(formatCurrencyInput(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawText = e.target.value;
      const parsedNum = parseCurrencyInput(rawText);

      if (!rawText.replace(/\D/g, '')) {
        setDisplayVal('');
        onChange?.(allowZero ? 0 : undefined);
        return;
      }

      setDisplayVal(formatCurrencyInput(parsedNum));
      onChange?.(parsedNum);
    };

    return (
      <div className="relative flex items-center">
        {showIcon && (
          <Banknote className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground" />
        )}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayVal}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border border-input bg-background py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            className,
            showIcon ? 'pl-11' : 'pl-3.5',
            suffix ? 'pr-14' : 'pr-3.5'
          )}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3.5 select-none text-xs font-bold text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

AppCurrencyInput.displayName = 'AppCurrencyInput';

export interface AppFormCurrencyInputProps<TFieldValues extends FieldValues>
  extends Omit<AppCurrencyInputProps, 'name'> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  required?: boolean;
  helperText?: string;
}

export const AppFormCurrencyInput = <TFieldValues extends FieldValues>({
  name,
  control,
  label,
  required,
  helperText,
  id,
  className,
  ...props
}: AppFormCurrencyInputProps<TFieldValues>) => {
  const inputId = id || name;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <div className={cn('space-y-1.5', className)}>
          {label && (
            <AppLabel
              htmlFor={inputId}
              className={cn('text-xs font-bold text-foreground', error && 'text-destructive')}
            >
              {label} {required && <span className="text-destructive">*</span>}
            </AppLabel>
          )}

          <AppCurrencyInput
            id={inputId}
            ref={ref}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            className={error ? 'border-destructive focus:border-destructive' : undefined}
            {...props}
          />

          {(error?.message || helperText) && (
            <p
              className={cn(
                'text-[11px] font-medium',
                error ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {error?.message || helperText}
            </p>
          )}
        </div>
      )}
    />
  );
};
