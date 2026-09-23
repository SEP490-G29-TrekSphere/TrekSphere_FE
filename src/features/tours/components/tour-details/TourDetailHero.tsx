import { ChevronRight, Clock, MapPin, Mountain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_TAGS,
  handleImageFallback,
} from '@/features/tours/components/tour-details/shared';
import type { TourDetailFromApi } from '@/features/tours/types';
import { formatTourDuration } from '@/utils/format';

interface TourDetailHeroProps {
  tour: TourDetailFromApi;
}

export function TourDetailHero({ tour }: TourDetailHeroProps) {
  const coverImage = tour.coverImageUrl || tour.images[0]?.imageUrl || null;

  return (
    <section
      className="relative h-[60vh] min-h-[420px] w-full overflow-hidden"
      aria-label={`Ảnh bìa tour ${tour.tourName}`}
    >
      {coverImage ? (
        <img
          src={coverImage}
          alt=""
          onError={handleImageFallback}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-primary" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/70 to-primary-dark/20" />

      <div className="absolute inset-0 flex flex-col justify-end">
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-8 sm:px-6 md:pb-12">
          {/* Breadcrumb */}
          <nav aria-label="Đường dẫn" className="mb-4">
            <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-white/70">
              <li>
                <Link to={PATHS.HOME} className="transition-colors hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <li>
                <Link to={PATHS.TOURS} className="transition-colors hover:text-white">
                  Tour
                </Link>
              </li>
            </ol>
          </nav>

          <span className="inline-block rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
            {DIFFICULTY_TAGS[tour.difficulty] ?? 'Cung đường huyền thoại'}
          </span>

          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            {tour.tourName}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              {tour.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {formatTourDuration(tour.durationDays)}
            </span>
            <span className="flex items-center gap-1.5">
              <Mountain className="h-4 w-4 shrink-0" aria-hidden="true" />
              {DIFFICULTY_LABELS[tour.difficulty] ?? tour.difficulty}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
