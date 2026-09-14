import { CheckCircle2 } from 'lucide-react';
import { useMyMatchingGroups } from '@/features/companion-groups/hooks/useMyMatchingGroups';
import { AppSpinner } from '@/shared/ui';
import { PROFILE_COMPLETED_TRIPS_PAGE_SIZE } from '../../constants';
import { CompletedTripCard } from './CompletedTripCard';
import { ProfileComingSoon } from './ProfileComingSoon';

interface ProfileCompletedTripsProps {
  isOwnProfile: boolean;
  /** Sinh đường dẫn chi tiết nhóm theo layout đang hiển thị hồ sơ. */
  groupDetailPath: (groupId: string) => string;
}

/**
 * Tab "Đã hoàn thành" — các chuyến đi ghép nhóm đã chuyển sang trạng thái COMPLETED.
 *
 * Nguồn dữ liệu là `GET /matching-groups/my-groups?status=COMPLETED`, chỉ trả về nhóm của
 * người đang đăng nhập; BE chưa có endpoint công khai nên hồ sơ người khác vẫn để trống.
 */
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
      <ProfileComingSoon
        icon={CheckCircle2}
        title="Chưa có cung đường hoàn thành"
        description="Danh sách chuyến đi đã chinh phục của người dùng khác chưa được chia sẻ công khai."
      />
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
      <ProfileComingSoon
        icon={CheckCircle2}
        title="Không tải được danh sách chuyến đi"
        description="Đã có lỗi khi lấy các chuyến đi đã hoàn thành. Vui lòng tải lại trang."
      />
    );
  }

  const trips = data?.content ?? [];

  if (trips.length === 0) {
    return (
      <ProfileComingSoon
        icon={CheckCircle2}
        title="Chưa có cung đường hoàn thành"
        description="Khi một nhóm ghép được Trưởng nhóm chuyển sang trạng thái Đã hoàn thành, chuyến đi sẽ xuất hiện tại đây."
      />
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
