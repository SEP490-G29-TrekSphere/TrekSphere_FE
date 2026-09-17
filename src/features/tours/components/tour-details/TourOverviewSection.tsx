import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import { splitField } from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';

/**
 * Vendor nhập "Lịch trình chi tiết" (`tour.description`) qua thanh công cụ Bold/Italic/List/Link ở
 * form tạo/sửa tour — thanh công cụ đó chèn cú pháp markdown (`**...**`, `_..._`, `- `, `[..](..)`),
 * nên phải render markdown ở đây, nếu không khách hàng sẽ thấy ký tự thô thay vì định dạng thật.
 */
const DESCRIPTION_MARKDOWN_COMPONENTS = {
  p: ({ children }: { children?: ReactNode }) => (
    <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="list-disc space-y-1 pl-5 text-[15px] leading-relaxed text-muted-foreground">
      {children}
    </ul>
  ),
  li: ({ children }: { children?: ReactNode }) => <li>{children}</li>,
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-primary underline underline-offset-2"
    >
      {children}
    </a>
  ),
};

interface TourOverviewSectionProps {
  tour: TourDetailFromApi;
}

/**
 * Khối "Tổng quan": các điểm nổi bật dạng chip + đoạn giới thiệu.
 *
 * `highlights` đứng trước phần mô tả dài vì đó là thứ người dùng quét mắt đầu tiên
 * khi cân nhắc giữa nhiều tour.
 */
export function TourOverviewSection({ tour }: TourOverviewSectionProps) {
  const highlights = splitField(tour.highlights);

  return (
    <div className="flex flex-col gap-6">
      {highlights.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {highlights.map((highlight) => (
            <li
              key={highlight}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/30 px-3 py-1.5 text-xs font-semibold text-accent-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {highlight}
            </li>
          ))}
        </ul>
      )}

      {tour.description ? (
        <Markdown components={DESCRIPTION_MARKDOWN_COMPONENTS}>{tour.description}</Markdown>
      ) : (
        <p className="text-sm italic text-muted-foreground">
          Nhà tổ chức chưa cập nhật phần giới thiệu cho tour này.
        </p>
      )}
    </div>
  );
}
