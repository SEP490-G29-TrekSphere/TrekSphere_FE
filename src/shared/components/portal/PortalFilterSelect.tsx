import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PortalFilterSelectOption<T = string> {
  value: T;
  label: string;
  count?: number;
}

export interface PortalFilterSelectProps<T = string> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  options: PortalFilterSelectOption<T>[];
  icon?: LucideIcon;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PortalFilterSelect<T = string>({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  placeholder = 'Chọn...',
  className = '',
  disabled = false,
}: PortalFilterSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={cn(
          'inline-flex h-10 items-center justify-between gap-2 rounded-full border border-[#E5E4DE] bg-white px-4 text-sm font-semibold text-[#06261D] shadow-sm transition-all hover:bg-[#FAF9F5] focus:outline-none focus:ring-2 focus:ring-[#0B3025]/20 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {Icon && <Icon className="h-4 w-4 text-[#6F7B75]" />}
        {label && <span className="text-[#6F7B75] font-medium">{label}:</span>}
        <span className="truncate max-w-[140px] sm:max-w-[200px]">{displayLabel}</span>
        {selectedOption?.count !== undefined && (
          <span className="ml-1 text-xs text-[#6F7B75]">({selectedOption.count})</span>
        )}
        <ChevronDown
          className={cn('h-3.5 w-3.5 text-[#6F7B75] transition-transform duration-200', {
            'rotate-180': isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 min-w-[200px] rounded-2xl border border-[#E5E4DE] bg-white p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95">
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-left text-sm font-medium transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-[#0B3025] text-white font-semibold'
                      : 'text-[#06261D] hover:bg-[#FAF9F5]'
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  <div className="flex items-center gap-2">
                    {option.count !== undefined && (
                      <span
                        className={cn('text-xs', isSelected ? 'text-white/80' : 'text-[#6F7B75]')}
                      >
                        ({option.count})
                      </span>
                    )}
                    {isSelected && <Check className="h-4 w-4 text-white shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
