import { CheckCircle2, Footprints } from 'lucide-react';
import { useState } from 'react';
import { PATHS } from '@/constants';
import { AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { useProfile } from '../../hooks/useProfile';
import { usePublicProfile, useUserBlogs } from '../../hooks/usePublicProfile';
import { ProfileBlogGrid } from './ProfileBlogGrid';
import { ProfileComingSoon } from './ProfileComingSoon';
import { ProfileIdentityCard } from './ProfileIdentityCard';
import { ProfileInfoPanel } from './ProfileInfoPanel';
import { ProfilePhotoGrid } from './ProfilePhotoGrid';
import { ProfileRatingSummary } from './ProfileRatingSummary';
import { PROFILE_INFO_TAB, PROFILE_TABS, type ProfileTabId, ProfileTabs } from './ProfileTabs';

interface ProfileScreenProps {
  /** `me`: hồ sơ của người đang đăng nhập. `public`: hồ sơ người khác theo `userId`. */
  mode: 'me' | 'public';
  /** Bắt buộc khi `mode = 'public'`. */
  userId?: string;
  /** Đường dẫn trang chỉnh sửa — khác nhau giữa MainLayout và TrekkerLayout. */
  editPath?: string;
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
export function ProfileScreen({ mode, userId, editPath = PATHS.EDIT_PROFILE }: ProfileScreenProps) {
  const currentUser = useAppStore((state) => state.user);

  const meQuery = useProfile();
  const publicQuery = usePublicProfile(mode === 'public' ? userId : undefined);

  const isMeMode = mode === 'me';
  const me = meQuery.data ?? null;
  const other = publicQuery.data ?? null;

  const resolvedUserId = isMeMode ? me?.id : userId;
  // Mở hồ sơ công khai của chính mình vẫn nên thấy nút "Chỉnh sửa hồ sơ".
  const isOwnProfile = isMeMode || (Boolean(currentUser?.id) && currentUser?.id === userId);

  const blogsQuery = useUserBlogs(resolvedUserId);
  const posts = blogsQuery.data?.items ?? [];
  const blogCount = blogsQuery.data?.meta.totalElements;

  const tabs = isMeMode ? [...PROFILE_TABS, PROFILE_INFO_TAB] : PROFILE_TABS;
  const [activeTab, setActiveTab] = useState<ProfileTabId>('blogs');

  const isLoading = isMeMode ? meQuery.isLoading : publicQuery.isLoading;
  const profileMissing = isMeMode ? meQuery.isError || !me : !publicQuery.isLoading && !other;

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

  const name = (isMeMode ? me?.name : other?.fullName) || 'Người dùng';
  const avatarUrl = isMeMode ? me?.avatar : other?.avatarUrl;
  const roleLabel = isMeMode && me?.roles?.[0] ? ROLE_LABELS[me.roles[0]] : undefined;

  const emptyBlogMessage = isOwnProfile
    ? 'Bạn chưa đăng bài viết nào.'
    : 'Người dùng này chưa có bài viết công khai.';

  const renderTab = () => {
    switch (activeTab) {
      case 'blogs':
        return (
          <ProfileBlogGrid
            posts={posts}
            isLoading={blogsQuery.isLoading}
            emptyMessage={emptyBlogMessage}
          />
        );
      case 'photos':
        return (
          <ProfilePhotoGrid
            posts={posts}
            isLoading={blogsQuery.isLoading}
            emptyMessage="Chưa có ảnh nào từ các bài viết."
          />
        );
      case 'reviews':
        return <ProfileRatingSummary />;
      case 'activities':
        return (
          <ProfileComingSoon
            icon={Footprints}
            title="Chưa có hoạt động"
            description="Nhật ký hành trình và các chuyến đi đã tham gia sẽ xuất hiện ở đây khi tính năng được mở."
          />
        );
      case 'completed':
        return (
          <ProfileComingSoon
            icon={CheckCircle2}
            title="Chưa có cung đường hoàn thành"
            description="Danh sách cung đường đã chinh phục sẽ hiển thị tại đây khi tính năng được mở."
          />
        );
      case 'info':
        return me ? <ProfileInfoPanel profile={me} /> : null;
      default:
        return null;
    }
  };

  return (
    // `pt-8` khớp với `lg:top-24` của card sticky bên trái (64px header + 32px),
    // để hai cột bắt đầu ngang nhau thay vì thanh tab dính sát header.
    <div className="mx-auto grid w-full max-w-[1100px] gap-8 px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProfileIdentityCard
          name={name}
          avatarUrl={avatarUrl}
          email={isMeMode ? me?.email : undefined}
          roleLabel={roleLabel}
          blogCount={blogCount}
          isOwnProfile={isOwnProfile}
          editPath={editPath}
          userId={resolvedUserId}
        />
      </div>

      <div className="min-w-0">
        <ProfileTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">{renderTab()}</div>
      </div>
    </div>
  );
}
