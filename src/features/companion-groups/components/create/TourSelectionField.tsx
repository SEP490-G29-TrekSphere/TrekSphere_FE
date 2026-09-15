import { Clock, Eye, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type {
  CreateMatchingGroupFormInput,
  CreateMatchingGroupFormValues,
} from '../../validations';
import { TourPreviewDetailModal } from './TourPreviewDetailModal';

export interface TourOption {
  id: string;
  name: string;
  image?: string;
  location?: string;
  level?: string;
  duration?: string;
  price?: string;
  minCapacity?: number;
  maxCapacity?: number;
}

interface TourSelectionFieldProps {
  form: UseFormReturn<CreateMatchingGroupFormInput, undefined, CreateMatchingGroupFormValues>;
  tours: TourOption[];
  isToursLoading: boolean;
  isPending: boolean;
  onTourSelected: (tourId: string) => void;
}

export function TourSelectionField({
  form,
  tours,
  isToursLoading,
  isPending,
  onTourSelected,
}: TourSelectionFieldProps) {
  const [previewTourId, setPreviewTourId] = useState<string | null>(null);
  const selectedTourId = form.watch('tourId');
  const selectedTour = tours.find((t) => t.id === selectedTourId);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Chọn tour <span className="text-destructive">*</span>
          </label>
          {selectedTourId && (
            <button
              type="button"
              onClick={() => setPreviewTourId(selectedTourId)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition-colors hover:text-primary/80 hover:underline"
            >
              <Eye className="h-3.5 w-3.5" />
              Xem chi tiết lộ trình Tour
            </button>
          )}
        </div>
        <select
          {...form.register('tourId', {
            onChange: (e) => onTourSelected(e.target.value),
          })}
          disabled={isToursLoading || isPending}
          className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-input bg-background px-4 pr-10 font-medium text-foreground text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>
            {isToursLoading ? 'Đang tải...' : 'Chọn tour để tạo nhóm ghép'}
          </option>
          {tours.map((tour) => (
            <option key={tour.id} value={tour.id}>
              {tour.name}
            </option>
          ))}
        </select>
        {form.formState.errors.tourId?.message && (
          <p className="text-destructive text-xs">{form.formState.errors.tourId.message}</p>
        )}
      </div>

      {selectedTour && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3 text-xs">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">{selectedTour.name}</h4>
              <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                {selectedTour.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    {selectedTour.location}
                  </span>
                )}
                {selectedTour.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                    {selectedTour.duration}
                  </span>
                )}
                {(selectedTour.minCapacity || selectedTour.maxCapacity) && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-emerald-600 shrink-0" />
                    {selectedTour.minCapacity || 1} - {selectedTour.maxCapacity || 20} người
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedTour.level && (
                <span className="rounded-md bg-background px-2 py-0.5 font-semibold text-primary border border-primary/20">
                  {selectedTour.level}
                </span>
              )}
              <button
                type="button"
                onClick={() => setPreviewTourId(selectedTour.id)}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 font-bold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Xem lộ trình
              </button>
            </div>
          </div>

          <p className="text-muted-foreground border-t border-primary/10 pt-2 text-[11px] leading-relaxed">
            Lộ trình và các điểm dừng (checkpoints) từ Tour sẽ được tự động nhân bản làm mẫu ban
            đầu. Nhóm của bạn có thể tự do chỉnh sửa, thêm/bớt các điểm dừng và hoạt động trong
            Không gian làm việc.
          </p>
        </div>
      )}

      {/* Tour Preview Modal */}
      <TourPreviewDetailModal
        isOpen={Boolean(previewTourId)}
        tourId={previewTourId}
        onClose={() => setPreviewTourId(null)}
      />
    </div>
  );
}
