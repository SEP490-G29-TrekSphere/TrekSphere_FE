import { Bold, Italic, Link2, List, Maximize2 } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { type Control, Controller, type FieldErrors } from 'react-hook-form';
import { AppModalShell } from '@/shared/ui';
import type { TourFormInput } from '../../validations';

interface TourDescriptionSectionProps {
  control: Control<TourFormInput>;
  errors: FieldErrors<TourFormInput>;
}

interface FormattingTransformResult {
  newValue: string;
  newStart: number;
  newEnd: number;
}

type FormattingTransform = (
  value: string,
  selectionStart: number,
  selectionEnd: number
) => FormattingTransformResult;

const wrapSelection =
  (marker: string): FormattingTransform =>
  (value, start, end) => {
    const selected = value.slice(start, end);
    const newValue = `${value.slice(0, start)}${marker}${selected}${marker}${value.slice(end)}`;
    return {
      newValue,
      newStart: start + marker.length,
      newEnd: start + marker.length + selected.length,
    };
  };

const prefixLines: FormattingTransform = (value, start, end) => {
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = value.indexOf('\n', end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;
  const block = value.slice(lineStart, lineEnd);
  const prefixed = block
    .split('\n')
    .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
    .join('\n');
  const newValue = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
  return { newValue, newStart: lineStart, newEnd: lineStart + prefixed.length };
};

const insertLink: FormattingTransform = (value, start, end) => {
  const selected = value.slice(start, end) || 'liên kết';
  const prefix = `[${selected}](`;
  const newValue = `${value.slice(0, start)}${prefix})${value.slice(end)}`;
  const cursor = start + prefix.length;
  return { newValue, newStart: cursor, newEnd: cursor };
};

function applyFormatting(
  textarea: HTMLTextAreaElement | null,
  value: string,
  onChange: (value: string) => void,
  transform: FormattingTransform
) {
  if (!textarea) return;
  const start = textarea.selectionStart ?? value.length;
  const end = textarea.selectionEnd ?? value.length;
  const { newValue, newStart, newEnd } = transform(value, start, end);
  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newStart, newEnd);
  });
}

interface FormattingToolbarProps {
  onAction: (transform: FormattingTransform) => void;
}

function FormattingToolbar({ onAction }: FormattingToolbarProps) {
  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <button
        type="button"
        onClick={() => onAction(wrapSelection('**'))}
        title="Chữ đậm"
        aria-label="Chữ đậm"
        className="cursor-pointer transition hover:text-foreground"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onAction(wrapSelection('*'))}
        title="Chữ nghiêng"
        aria-label="Chữ nghiêng"
        className="cursor-pointer transition hover:text-foreground"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onAction(prefixLines)}
        title="Danh sách gạch đầu dòng"
        aria-label="Danh sách gạch đầu dòng"
        className="cursor-pointer transition hover:text-foreground"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onAction(insertLink)}
        title="Chèn liên kết"
        aria-label="Chèn liên kết"
        className="cursor-pointer transition hover:text-foreground"
      >
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function TourDescriptionSection({ control, errors }: TourDescriptionSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const inlineRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLTextAreaElement>(null);
  const inputId = useId();

  return (
    <Controller
      name="description"
      control={control}
      render={({ field }) => (
        <section className="space-y-3 rounded-3xl border border-border bg-card p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Lịch trình chi tiết
            </h3>
            <div className="flex items-center gap-3">
              <FormattingToolbar
                onAction={(transform) =>
                  applyFormatting(inlineRef.current, field.value ?? '', field.onChange, transform)
                }
              />
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                title="Mở rộng để gõ dễ hơn"
                aria-label="Mở rộng ô nhập"
                className="cursor-pointer text-muted-foreground transition hover:text-foreground"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <textarea
            id={inputId}
            ref={inlineRef}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            rows={8}
            placeholder="Mô tả lịch trình chi tiết từng ngày, các điểm dừng chân, dịch vụ bao gồm và lưu ý quan trọng... Hỗ trợ định dạng Markdown (đậm, nghiêng, danh sách, liên kết)."
            className="w-full resize-none rounded-[20px] bg-muted/50 px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}

          <AppModalShell
            open={isExpanded}
            onClose={() => setIsExpanded(false)}
            className="max-w-2xl"
            showCloseButton
            aria-label="Lịch trình chi tiết"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between pr-8">
                <h3 className="text-sm font-bold text-foreground">Lịch trình chi tiết</h3>
                <FormattingToolbar
                  onAction={(transform) =>
                    applyFormatting(modalRef.current, field.value ?? '', field.onChange, transform)
                  }
                />
              </div>
              <textarea
                ref={modalRef}
                // biome-ignore lint/a11y/noAutofocus: opening the modal is an explicit user action to edit this exact field
                autoFocus
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                rows={16}
                placeholder="Mô tả lịch trình chi tiết từng ngày, các điểm dừng chân, dịch vụ bao gồm và lưu ý quan trọng..."
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
        </section>
      )}
    />
  );
}
