import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useRecommendedTours } from '@/features/tours/hooks/useRecommendedTours';
import { useMediaQuery } from '@/shared/hooks';
import { ScrollReveal, Slider } from '@/shared/ui';

/**
 * Gợi ý tour cá nhân hoá cho Trekker đã đăng nhập — chỉ render khi có `user`
 * (ẩn hẳn với Guest, không hiện section rỗng). Cùng bố cục slider với
 * `HomeTours.tsx`, khác ở nguồn dữ liệu (`GET /tours/recommended`) và có
 * thêm tag lý do gợi ý dưới tên tour.
 */
export default function HomeRecommended() {
  const { tours, isLoading } = useRecommendedTours();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  const slidesPerView = isMobile ? 1 : isTablet ? 2 : 3;

  if (!isLoading && tours.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="max-w-none w-full mx-auto px-4 sm:px-6">
        <ScrollReveal variant="fade-up">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
            <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight">
              Gợi ý dành cho bạn
            </h2>
            <Link
              to={PATHS.TOURS}
              className="inline-flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70 text-primary shrink-0"
            >
              Xem tất cả
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {['rc-1', 'rc-2', 'rc-3'].map((skeletonId) => (
              <div key={skeletonId} className="h-[420px] rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <ScrollReveal variant="fade-up" scrollOptions={{ delay: 100 }}>
            <div className="mt-10">
              <Slider slidesPerView={slidesPerView} autoplayInterval={3500}>
                {tours.map((tour) => (
                  <article key={tour.id} className="tour-card">
                    <div className="tour-image-wrapper">
                      <img
                        src={tour.image}
                        alt={tour.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80';
                        }}
                      />
                      <div
                        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-[#0f201c]/55"
                        aria-hidden="true"
                      />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <span className="text-xs font-medium text-white">
                          {tour.matchReasonLabel}
                        </span>
                      </div>
                    </div>

                    <div className="tour-content-wrapper">
                      <h3 className="text-base font-bold leading-snug text-primary line-clamp-2">
                        {tour.name}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {tour.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                            />
                          </svg>
                          {tour.level}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div>
                          <p className="text-xs text-muted-foreground">Từ</p>
                          <p className="text-xl font-black text-primary">{tour.price}</p>
                        </div>
                        <Link
                          to={`${PATHS.TOURS}/${tour.id}`}
                          className="px-5 py-2 rounded-full text-sm font-semibold text-white hover:opacity-90 bg-primary cursor-pointer"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </Slider>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
