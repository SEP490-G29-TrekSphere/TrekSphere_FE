import type { UseFormRegister } from 'react-hook-form';
import type { TourFormInput } from '../../validations';

interface TourHighlightsServicesSectionProps {
  register: UseFormRegister<TourFormInput>;
}

export function TourHighlightsServicesSection({ register }: TourHighlightsServicesSectionProps) {
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

      <div>
        <label htmlFor="highlights" className="mb-1.5 block text-sm font-semibold text-foreground">
          Điểm nổi bật của tour
        </label>
        <textarea
          id="highlights"
          rows={3}
          {...register('highlights')}
          placeholder="- Ngắm biển mây bồng bềnh&#10;- Chinh phục đỉnh núi nóc nhà Đông Dương&#10;- Trải nghiệm ẩm thực người bản địa"
          className="w-full resize-none rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="includes" className="mb-1.5 block text-sm font-semibold text-foreground">
            Dịch vụ bao gồm trong tour
          </label>
          <textarea
            id="includes"
            rows={3}
            {...register('includes')}
            placeholder="- Hướng dẫn viên và Porter bản địa&#10;- Bữa ăn và nước uống suốt hành trình&#10;- Lều trại và túi ngủ chuyên dụng&#10;- Bảo hiểm du lịch"
            className="w-full resize-none rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="excludes" className="mb-1.5 block text-sm font-semibold text-foreground">
            Dịch vụ không bao gồm
          </label>
          <textarea
            id="excludes"
            rows={3}
            {...register('excludes')}
            placeholder="- Chi phí cá nhân phát sinh ngoài chương trình&#10;- Vé máy bay/tàu xe đến điểm tập kết&#10;- Tiền tip cho HDV/Porter"
            className="w-full resize-none rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>
    </section>
  );
}
