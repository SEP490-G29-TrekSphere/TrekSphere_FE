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
  /** 'me': authenticated user profile. 'public': external profile by userId. */
  mode: 'me' | 'public';
  /** Target user id required when mode = 'public'. */
  userId?: string;
  /** Edit profile navigation path. */
  editPath?: string;
  /** Change password navigation path. */
  changePasswordPath?: string;
  /** Render fluid 100% full-width in layouts with sidebar. */
  fluid?: boolean;
  /** Companion group detail route generator. */
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
 * Universal profile screen layout for self and public user views.
 * Features an identity sidebar card on the left and tabbed panels on the right.
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
  // Fallback identity data from public hiking summary
  const hikingQuery = usePublicHikingSummary(mode === 'public' ? userId : undefined);

  const isMeMode = mode === 'me';
  const me = meQuery.data ?? null;
  const publicHiking = hikingQuery.data ?? null;
  const other = publicQuery.data ?? null;

  const resolvedUserId = isMeMode ? me?.id : userId;
  // Own profile detection in public view
  const isOwnProfile = isMeMode || (Boolean(currentUser?.id) && currentUser?.id === userId);

  // Total blogs count for identity badge
  const blogCount = useUserBlogs(resolvedUserId).data?.meta.totalElements;

  // Tabs setup based on mode
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

        {/* Display hiking summary card on left column for other users */}
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
