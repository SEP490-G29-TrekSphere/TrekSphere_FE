import { Maximize2 } from 'lucide-react';
import { useId, useState } from 'react';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { AppModalShell } from '@/shared/ui/components/AppModalShell';
import { AppLabel } from '@/shared/ui/primitives/AppLabel';

export interface ExpandableTextareaFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  helperText?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  error?: string;
  className?: string;
  /** Override the inline textarea's own classes (e.g. to match a surrounding card's bg color). */
  textareaClassName?: string;
}

const DEFAULT_TEXTAREA_CLASSNAME = 'bg-muted/50 text-foreground';

/**
 * A regular-sized textarea with an "expand" button that opens a large modal
 * editor for the same value — useful for long free-text fields (participation
 * policy requirements, itinerary description, checkpoint notes...) that feel
 * cramped in a 2-3 row box. Plain controlled value/onChange, no react-hook-form
 * dependency — see `AppExpandableTextarea` below for the form-bound wrapper.
 */
export function ExpandableTextareaField({
  id,
  value,
  onChange,
  onBlur,
  label,
  helperText,
  placeholder,
  rows = 2,
  disabled,
  error,
  className,
  textareaClassName = DEFAULT_TEXTAREA_CLASSNAME,
}: ExpandableTextareaFieldProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      {label && (
        <AppLabel htmlFor={inputId} className={error ? 'text-destructive' : ''}>
          {label}
        </AppLabel>
      )}

      <div className="relative">
        <textarea
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`hide-scrollbar w-full resize-none overflow-y-auto rounded-xl px-4 py-3 pr-9 text-sm font-medium outline-none focus:ring-1 ${textareaClassName} ${
            error ? 'ring-1 ring-destructive' : 'focus:ring-primary'
          }`}
        />
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          disabled={disabled}
          title="Mở rộng để gõ dễ hơn"
          aria-label="Mở rộng ô nhập"
          className="absolute right-2 top-2 cursor-pointer rounded-lg p-1 text-muted-foreground transition hover:bg-background hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {(error || helperText) && (
        <p className={`text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {error || helperText}
        </p>
      )}

      <AppModalShell
        open={isExpanded}
        onClose={() => setIsExpanded(false)}
        className="max-w-2xl"
        showCloseButton
        aria-label={label ?? 'Chỉnh sửa nội dung'}
      >
        <div className="space-y-3">
          {label && <h3 className="pr-8 text-sm font-bold text-foreground">{label}</h3>}
          <textarea
            // biome-ignore lint/a11y/noAutofocus: opening the modal is an explicit user action to edit this exact field
            autoFocus
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            placeholder={placeholder}
            rows={14}
            className="w-full resize-none rounded-2xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="cursor-pointer rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
            >
              Xong
            </button>
          </div>
        </div>
      </AppModalShell>
    </div>
  );
}

export interface AppExpandableTextareaProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label?: string;
  helperText?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

/** `ExpandableTextareaField` wired to a react-hook-form field via `Controller`. */
export const AppExpandableTextarea = <TFieldValues extends FieldValues>({
  name,
  control,
  ...fieldProps
}: AppExpandableTextareaProps<TFieldValues>) => {
  const generatedId = useId();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <ExpandableTextareaField
          id={generatedId}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={error?.message ? String(error.message) : undefined}
          {...fieldProps}
        />
      )}
    />
  );
};
