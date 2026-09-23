import { Bold, Italic, Link2, List } from 'lucide-react';
import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import type { TourFormInput } from '../../validations';

interface TourDescriptionSectionProps {
  register: UseFormRegister<TourFormInput>;
  errors: FieldErrors<TourFormInput>;
}

export function TourDescriptionSection({ register, errors }: TourDescriptionSectionProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-border bg-card p-6 lg:col-span-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Lịch trình chi tiết
        </h3>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Bold className="h-4 w-4" />
          <Italic className="h-4 w-4" />
          <List className="h-4 w-4" />
          <Link2 className="h-4 w-4" />
        </div>
      </div>
      <textarea
        {...register('description')}
        rows={8}
        placeholder="Mô tả lịch trình chi tiết từng ngày, các điểm dừng chân, dịch vụ bao gồm và lưu ý quan trọng..."
        className="w-full resize-none rounded-[20px] bg-muted/50 px-4 py-3 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {errors.description && (
        <p className="text-xs text-destructive">{errors.description.message}</p>
      )}
    </section>
  );
}
