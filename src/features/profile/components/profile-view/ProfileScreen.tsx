import { useState } from 'react';
import { getGroupDetailPath, PATHS } from '@/constants';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { useProfile } from '../../hooks/useProfile';
import {
  usePublicHikingSummary,
  usePublicProfile,
  useUserBlogs,
} from '../../hooks/usePublicProfile';
import type { HikingProfileView } from '../../types';
import { ProfileCompletedTrips } from './ProfileCompletedTrips';
import { ProfileHikingPanel } from './ProfileHikingPanel';
import { ProfileIdentityCard } from './ProfileIdentityCard';
import { ProfileInfoPanel } from './ProfileInfoPanel';
import { ProfileMomentsPanel } from './ProfileMomentsPanel';
import { ProfileRatingSummary } from './ProfileRatingSummary';
import { PROFILE_INFO_TAB, PROFILE_TABS, type ProfileTabId, ProfileTabs } from './ProfileTabs';

interface ProfileScreenProps {
  /** `me`: hồ sơ của người đang đăng nhập. `public`: hồ sơ người khác theo `userId`. */
  mode: 'me' | 'public';
  /** Bắt buộc khi `mode = 'public'`. */
  userId?: string;
  /** Đường dẫn trang chỉnh sửa — khác nhau giữa MainLayout và TrekkerLayout. */
  editPath?: string;
  /** Đường dẫn trang đổi mật khẩu — khác nhau giữa MainLayout và TrekkerLayout. */
  changePasswordPath?: string;
  /** Trải rộng 100% full-width và căn sát lề (dùng trong portal có sidebar). */
  fluid?: boolean;
  /** Sinh đường dẫn chi tiết nhóm ghép — khác nhau giữa MainLayout và TrekkerLayout. */
  groupDetailPath?: (groupId: string) => string;
}

const ROLE_LABELS: Record<string, string> = {
  trekker: 'Trekker',
  vendor_staff: 'Nhân viên đối tác',
  vendor_manager: 'Quản lý đối tác',
  coordinator: 'Điều phối viên',
  admin: 'Quản trị viên',
};

/**
 * Khung màn hình hồ sơ dùng chung cho cả `/profile` và `/users/:userId` —
 * bố cục theo reference AllTrails: card định danh bên trái (sticky) và
 * cột nội dung có thanh tab bên phải.
 *
 * Hồ sơ người khác CHỈ hiển thị tên, ảnh đại diện và nội dung công khai.
 * Email / số điện thoại / ngày sinh chỉ xuất hiện ở hồ sơ của chính mình.
 */
export function ProfileScreen({
  mode,
  userId,
  editPath = PATHS.EDIT_PROFILE,
  changePasswordPath = PATHS.CHANGE_PASSWORD,
  fluid = false,
  groupDetailPath = getGroupDetailPath,
}: ProfileScreenProps) {
  const currentUser = useAppStore((state) => state.user);

  const meQuery = useProfile();
  const publicQuery = usePublicProfile(mode === 'public' ? userId : undefined);
  // Hồ sơ leo núi của người khác: endpoint công khai thật, có cả tên và ảnh nên
  // dùng luôn làm nguồn danh tính khi người đó chưa viết bài blog nào.
  const hikingQuery = usePublicHikingSummary(mode === 'public' ? userId : undefined);

  const isMeMode = mode === 'me';
  const me = meQuery.data ?? null;
  const publicHiking = hikingQuery.data ?? null;
  const other = publicQuery.data ?? null;

  const resolvedUserId = isMeMode ? me?.id : userId;
  // Mở hồ sơ công khai của chính mình vẫn nên thấy nút "Chỉnh sửa hồ sơ".
  const isOwnProfile = isMeMode || (Boolean(currentUser?.id) && currentUser?.id === userId);

  // Chỉ còn dùng cho số "Bài viết" trên card định danh — tab Bài viết/Ảnh đã gỡ khỏi hồ sơ.
  const blogCount = useUserBlogs(resolvedUserId).data?.meta.totalElements;

  // Hồ sơ của chính mình: "Thông tin" đứng đầu vì đây là phần người dùng vào xem/sửa nhiều nhất.
  const tabs = isMeMode ? [PROFILE_INFO_TAB, ...PROFILE_TABS] : PROFILE_TABS;
  // Vào hồ sơ của mình thì mở sẵn "Thông tin" (tab đầu tiên); xem hồ sơ người khác
  // vẫn mở "Hồ sơ leo núi" vì đó mới là nội dung công khai đầu tiên của họ.
  const [activeTab, setActiveTab] = useState<ProfileTabId>(isMeMode ? 'info' : 'hiking');

  const isLoading = isMeMode ? meQuery.isLoading : publicQuery.isLoading || hikingQuery.isLoading;
  const profileMissing = isMeMode ? meQuery.isError || !me : !isLoading && !other && !publicHiking;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <AppSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (profileMissing) {
    const message = isMeMode
      ? meQuery.error instanceof Error
        ? meQuery.error.message
        : 'Không thể tải hồ sơ. Vui lòng đăng nhập hoặc thử lại sau.'
      : 'Không tìm thấy người dùng này, hoặc họ chưa có nội dung công khai nào.';

    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
        <p className="text-base font-semibold text-primary">Không hiển thị được hồ sơ</p>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {isMeMode ? (
          <button
            type="button"
            onClick={() => void meQuery.refetch()}
            className="mt-6 cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Thử lại
          </button>
        ) : null}
      </div>
    );
  }

  const name = (isMeMode ? me?.name : (publicHiking?.fullName ?? other?.fullName)) || 'Người dùng';
  const avatarUrl = isMeMode ? me?.avatar : (publicHiking?.avatarUrl ?? other?.avatarUrl);
  const hikingSummary: HikingProfileView | null = isMeMode ? me : publicHiking;
  const roleLabel = isMeMode && me?.roles?.[0] ? ROLE_LABELS[me.roles[0]] : undefined;

  const renderTab = () => {
    switch (activeTab) {
      case 'hiking':
        return (
          <ProfileHikingPanel
            summary={hikingSummary}
            isOwnProfile={isOwnProfile}
            editPath={editPath}
          />
        );
      case 'moments':
        return (
          <ProfileMomentsPanel
            userId={resolvedUserId}
            isOwnProfile={isOwnProfile}
            currentUserId={currentUser?.id}
          />
        );
      case 'reviews':
        return <ProfileRatingSummary userId={resolvedUserId} />;
      case 'completed':
        return (
          <ProfileCompletedTrips isOwnProfile={isOwnProfile} groupDetailPath={groupDetailPath} />
        );
      case 'info':
        return me ? <ProfileInfoPanel profile={me} /> : null;
      default:
        return null;
    }
  };

  return (
    // Ở chế độ thường, `pt-8` khớp với `lg:top-24` của card sticky bên trái
    // (64px header + 32px) để hai cột bắt đầu ngang nhau thay vì thanh tab
    // dính sát header. Ở chế độ `fluid` (portal có sidebar) không có header
    // nổi nên card sticky bám `lg:top-0`.
    <div
      className={
        fluid
          ? 'grid w-full gap-8 pb-16 lg:grid-cols-[320px_minmax(0,1fr)]'
          : 'mx-auto grid w-full max-w-[1100px] gap-8 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[320px_minmax(0,1fr)]'
      }
    >
      <div
        className={fluid ? 'lg:sticky lg:top-0 lg:self-start' : 'lg:sticky lg:top-24 lg:self-start'}
      >
        <ProfileIdentityCard
          name={name}
          avatarUrl={avatarUrl}
          email={isMeMode ? me?.email : undefined}
          roleLabel={roleLabel}
          blogCount={blogCount}
          isOwnProfile={isOwnProfile}
          editPath={editPath}
          changePasswordPath={changePasswordPath}
          userId={resolvedUserId}
          experienceLevel={hikingSummary?.experienceLevel}
          trustScore={hikingSummary?.trustScore}
          trustReviewCount={hikingSummary?.trustReviewCount}
        />
      </div>

      <div className="min-w-0">
        <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">{renderTab()}</div>
      </div>
    </div>
  );
}
