/**
 * Barrel export cho feature profile.
 */

export * from './components/modals/ProfileCompletionModal';
export * from './components/ProfileSidebar';
// Màn hình hồ sơ (dùng chung cho `/profile` và `/users/:userId`)
export { ProfileBlogsPanel } from './components/profile-view/ProfileBlogsPanel';
export { ProfileComingSoon } from './components/profile-view/ProfileComingSoon';
export { ProfileCompletedTrips } from './components/profile-view/ProfileCompletedTrips';
export { ProfileHikingPanel } from './components/profile-view/ProfileHikingPanel';
export { ProfileIdentityCard } from './components/profile-view/ProfileIdentityCard';
export { ProfileInfoPanel } from './components/profile-view/ProfileInfoPanel';
export { ProfileMomentsPanel } from './components/profile-view/ProfileMomentsPanel';
export { ProfileRatingSummary } from './components/profile-view/ProfileRatingSummary';
export { ProfileScreen } from './components/profile-view/ProfileScreen';
export {
  MY_PROFILE_TABS,
  MY_PROFILE_TABS as PROFILE_TABS,
  type ProfileTabDef,
  type ProfileTabId,
  ProfileTabs,
  PUBLIC_PROFILE_TABS,
} from './components/profile-view/ProfileTabs';
export * from './hooks/useProfile';
export {
  PROFILE_BLOG_PAGE_SIZE,
  usePublicHikingSummary,
  usePublicProfile,
  useUserBlogs,
} from './hooks/usePublicProfile';
export * from './hooks/useUserMoments';
export { default as EditProfile } from './pages/EditProfile';
export { default as PublicProfile } from './pages/PublicProfile';
export { default as ViewProfile } from './pages/ViewProfile';
export { profileService } from './services/profileService';
export {
  type PublicUserProfile,
  publicProfileService,
} from './services/publicProfileService';
export * from './types';
export * from './utils/profileCompleteness';
