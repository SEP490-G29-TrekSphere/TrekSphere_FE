import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ExpandableSectionProps {
  children: React.ReactNode;
  collapsedClassName?: string;
  fadeFromClassName?: string;
}

export function ExpandableSection({
  children,
  collapsedClassName = 'max-h-64',
  fadeFromClassName = 'from-card',
}: ExpandableSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className={cn('relative overflow-hidden', !expanded && collapsedClassName)}>
        {children}
        {!expanded && (
          <div
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent',
              fadeFromClassName
            )}
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-3 text-sm font-semibold text-primary hover:underline"
      >
        {expanded ? 'Thu gọn' : 'Mở rộng'}
      </button>
    </div>
  );
}
