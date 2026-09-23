import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeerReviewStarInputProps {
  label: string;
  hint: string;
  value: number;
  onChange: (value: number) => void;
}

const SCORE_LABELS: Record<number, string> = {
  5: 'Xuất sắc',
  4: 'Tốt',
  3: 'Đạt yêu cầu',
  2: 'Cần cải thiện',
  1: 'Kém',
};

export function PeerReviewStarInput({ label, hint, value, onChange }: PeerReviewStarInputProps) {
  return (
    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
      <div className="space-y-0.5">
        <span className="block font-bold text-foreground text-xs">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{hint}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="cursor-pointer border-0 bg-transparent p-0.5 transition hover:scale-110"
              aria-label={`${label}: ${star} sao`}
              aria-pressed={star === value}
            >
              <Star
                className={cn(
                  'h-5 w-5 transition-colors',
                  star <= value ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground/30'
                )}
              />
            </button>
          ))}
        </div>
        <span className="min-w-[75px] text-right font-semibold text-primary text-xs">
          {SCORE_LABELS[value]}
        </span>
      </div>
    </div>
  );
}
