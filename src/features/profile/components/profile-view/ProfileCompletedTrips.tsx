import { CheckCircle2, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PATHS } from '@/constants';
import { useMyMatchingGroups } from '@/features/companion-groups/hooks/useMyMatchingGroups';
import { AppSpinner } from '@/shared/ui';
import { PROFILE_COMPLETED_TRIPS_PAGE_SIZE } from '../../constants';
import { CompletedTripCard } from './CompletedTripCard';

interface ProfileCompletedTripsProps {
  isOwnProfile: boolean;

  groupDetailPath: (groupId: string) => string;
}

export function ProfileCompletedTrips({
  isOwnProfile,
  groupDetailPath,
}: ProfileCompletedTripsProps) {
  const { data, isLoading, isError } = useMyMatchingGroups(
    { status: 'COMPLETED', size: PROFILE_COMPLETED_TRIPS_PAGE_SIZE },
    { enabled: isOwnProfile }
  );

  if (!isOwnProfile) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-card px-6 py-14 text-center shadow-xs border border-border">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">Chưa có chuyến đi hoàn thành</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-xs text-muted-foreground">
          Người dùng này chưa có chuyến đi ghép nhóm nào ở trạng thái hoàn thành trên TrekSphere.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-card p-10 shadow-sm">
        <AppSpinner size="default" className="text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-card px-6 py-14 text-center shadow-xs border border-border">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-destructive">
          Không tải được danh sách chuyến đi
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-xs text-muted-foreground">
          Đã có lỗi xảy ra khi tải các chuyến đi đã hoàn thành. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  const trips = data?.content ?? [];

  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl bg-card px-6 py-14 text-center shadow-xs border border-border">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Compass className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-bold text-foreground">Chưa tham gia chuyến đi nào</h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-muted-foreground leading-relaxed">
          Bạn chưa hoàn thành chuyến đi ghép nhóm nào. Hãy tham gia các nhóm ghép hoặc tự tạo nhóm
          để cùng đồng đội chinh phục những cung đường tuyệt đẹp!
        </p>
        <Link
          to={PATHS.GROUPS}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-primary-hover shadow-xs"
        >
          <Compass className="size-4" />
          Khám phá nhóm ghép đoàn
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-border border-b pb-3">
        <div>
          <h3 className="flex items-center gap-2 font-extrabold text-base text-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Cung đường đã chinh phục
          </h3>
          <p className="mt-0.5 text-muted-foreground text-xs">
            Các chuyến đi ghép nhóm bạn đã hoàn thành cùng đồng đội.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 font-bold text-primary text-xs">
          {data?.totalElements ?? trips.length} chuyến đi
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trips.map((group) => (
          <CompletedTripCard
            key={group.matchingGroupId}
            group={group}
            detailPath={groupDetailPath(group.matchingGroupId)}
          />
        ))}
      </div>
    </div>
  );
}
