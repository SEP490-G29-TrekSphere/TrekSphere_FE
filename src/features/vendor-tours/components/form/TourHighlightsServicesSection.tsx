import type { Control } from 'react-hook-form';
import { AppExpandableTextarea } from '@/shared/ui';
import type { TourFormInput } from '../../validations';

interface TourHighlightsServicesSectionProps {
  control: Control<TourFormInput>;
}

export function TourHighlightsServicesSection({ control }: TourHighlightsServicesSectionProps) {
  return (
    <section className="space-y-5 rounded-3xl border border-border bg-card p-6 lg:col-span-5">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Điểm nổi bật &amp; Dịch vụ
        </h3>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Thông tin chi tiết về các điểm hấp dẫn và dịch vụ tour giúp khách hàng dễ dàng đưa ra
          quyết định.
        </p>
      </div>

      <AppExpandableTextarea
        name="highlights"
        control={control}
        label="Điểm nổi bật của tour"
        rows={3}
        placeholder={
          '- Ngắm biển mây bồng bềnh\n- Chinh phục đỉnh núi nóc nhà Đông Dương\n- Trải nghiệm ẩm thực người bản địa'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AppExpandableTextarea
          name="includes"
          control={control}
          label="Dịch vụ bao gồm trong tour"
          rows={3}
          placeholder={
            '- Hướng dẫn viên và Porter bản địa\n- Bữa ăn và nước uống suốt hành trình\n- Lều trại và túi ngủ chuyên dụng\n- Bảo hiểm du lịch'
          }
        />

        <AppExpandableTextarea
          name="excludes"
          control={control}
          label="Dịch vụ không bao gồm"
          rows={3}
          placeholder={
            '- Chi phí cá nhân phát sinh ngoài chương trình\n- Vé máy bay/tàu xe đến điểm tập kết\n- Tiền tip cho HDV/Porter'
          }
        />
      </div>
    </section>
  );
}
