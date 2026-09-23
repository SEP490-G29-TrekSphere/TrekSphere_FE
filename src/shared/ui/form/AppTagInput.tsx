import { Plus, X } from 'lucide-react';
import { type KeyboardEvent, useId, useState } from 'react';
import { cn } from '@/lib/utils';

export interface AppTagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  id?: string;
  placeholder?: string;

  maxTags?: number;
  maxTagLength?: number;

  suggestions?: string[];
  disabled?: boolean;
  className?: string;
}

export function AppTagInput({
  value,
  onChange,
  id,
  placeholder = 'Nhập rồi nhấn Enter...',
  maxTags,
  maxTagLength,
  suggestions,
  disabled = false,
  className,
}: AppTagInputProps) {
  const [draft, setDraft] = useState('');
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isFull = typeof maxTags === 'number' && value.length >= maxTags;

  function addTag(raw: string) {
    const tag = raw.trim().replace(/\s+/g, ' ');
    if (!tag || isFull) return;
    const exists = value.some((item) => item.toLowerCase() === tag.toLowerCase());
    if (exists) {
      setDraft('');
      return;
    }
    onChange([...value, maxTagLength ? tag.slice(0, maxTagLength) : tag]);
    setDraft('');
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
      return;
    }
    if (event.key === 'Backspace' && !draft && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  const openSuggestions = (suggestions ?? []).filter(
    (item) => !value.some((tag) => tag.toLowerCase() === item.toLowerCase())
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-transparent bg-muted p-2 transition-colors focus-within:border-primary">
        {value.map((tag, index) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-primary shadow-xs"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              disabled={disabled}
              aria-label={`Xoá ${tag}`}
              className="cursor-pointer rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive disabled:cursor-not-allowed"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          disabled={disabled || isFull}
          maxLength={maxTagLength}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={isFull ? 'Đã đạt số lượng tối đa' : placeholder}
          className="h-8 min-w-[10rem] flex-1 bg-transparent px-1.5 text-sm font-medium text-primary outline-none placeholder:font-normal placeholder:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>

      {openSuggestions.length > 0 && !isFull && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Gợi ý:</span>
          {openSuggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => addTag(item)}
              disabled={disabled}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed"
            >
              <Plus className="size-3" />
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
