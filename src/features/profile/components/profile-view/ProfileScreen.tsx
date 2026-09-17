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
import { ProfileBlogsPanel } from './ProfileBlogsPanel';
import { ProfileCompletedTrips } from './ProfileCompletedTrips';
import { ProfileHikingPanel } from './ProfileHikingPanel';
import { ProfileIdentityCard } from './ProfileIdentityCard';
import { ProfileInfoPanel } from './ProfileInfoPanel';
import { ProfileMomentsPanel } from './ProfileMomentsPanel';
import { ProfileRatingSummary } from './ProfileRatingSummary';
import {
  MY_PROFILE_TABS,
  type ProfileTabId,
  ProfileTabs,
  PUBLIC_PROFILE_TABS,
} from './ProfileTabs';

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

  // Hồ sơ của chính mình: giữ nguyên danh sách tabs và mở sẵn tab "Thông tin".
  // Xem hồ sơ người khác: dùng PUBLIC_PROFILE_TABS và mở sẵn tab "Bài viết".
  const tabs = isMeMode ? MY_PROFILE_TABS : PUBLIC_PROFILE_TABS;
  const [activeTab, setActiveTab] = useState<ProfileTabId>(isMeMode ? 'info' : 'blogs');

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
    const hikingErr = hikingQuery.error as { message?: string; status?: number } | null;
    const publicErr = publicQuery.error as { message?: string; status?: number } | null;
    const isLockedError =
      hikingErr?.message?.toLowerCase().includes('khóa') ||
      publicErr?.message?.toLowerCase().includes('khóa') ||
      hikingErr?.status === 403 ||
      publicErr?.status === 403;

    const title = isLockedError ? 'Tài khoản đã bị khóa' : 'Không hiển thị được hồ sơ';

    const message = isLockedError
      ? 'Tài khoản này đã bị khóa do vi phạm tiêu chuẩn cộng đồng. Toàn bộ thông tin cá nhân đã bị ẩn.'
      : isMeMode
        ? meQuery.error instanceof Error
          ? meQuery.error.message
          : 'Không thể tải hồ sơ. Vui lòng đăng nhập hoặc thử lại sau.'
        : 'Không tìm thấy người dùng này, hoặc họ chưa có nội dung công khai nào.';

    return (
      <div className="mx-auto w-full max-w-md px-4 py-20 text-center">
        <p className={`text-base font-semibold ${isLockedError ? 'text-red-600' : 'text-primary'}`}>
          {title}
        </p>
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
      case 'info':
        return me ? <ProfileInfoPanel profile={me} editPath={editPath} /> : null;
      case 'hiking':
        return (
          <ProfileHikingPanel
            summary={hikingSummary}
            isOwnProfile={isOwnProfile}
            editPath={editPath}
          />
        );
      case 'blogs':
        return <ProfileBlogsPanel userId={resolvedUserId} isOwnProfile={isOwnProfile} />;
      case 'moments':
        return (
          <ProfileMomentsPanel
            userId={resolvedUserId}
            isOwnProfile={isOwnProfile}
            currentUserId={currentUser?.id}
          />
        );
      case 'reviews':
        return <ProfileRatingSummary userId={resolvedUserId} isOwnProfile={isOwnProfile} />;
      case 'completed':
        return (
          <ProfileCompletedTrips isOwnProfile={isOwnProfile} groupDetailPath={groupDetailPath} />
        );
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
        className={
          fluid
            ? 'flex flex-col gap-6 lg:sticky lg:top-0 lg:self-start'
            : 'flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start'
        }
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

        {/* Chỉ hiển thị thẻ Hồ sơ leo núi ở cột trái khi xem hồ sơ công khai của người khác */}
        {!isMeMode && (
          <ProfileHikingPanel
            summary={hikingSummary}
            isOwnProfile={isOwnProfile}
            editPath={editPath}
          />
        )}
      </div>

      <div className="min-w-0">
        <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">{renderTab()}</div>
      </div>
    </div>
  );
}
