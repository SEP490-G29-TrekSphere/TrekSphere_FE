/**
 * Barrel export cho feature profile.
 */

export * from './components/ProfileSidebar';
// Màn hình hồ sơ (dùng chung cho `/profile` và `/users/:userId`)
export { ProfileBlogGrid } from './components/profile-view/ProfileBlogGrid';
export { ProfileComingSoon } from './components/profile-view/ProfileComingSoon';
export { ProfileHikingPanel } from './components/profile-view/ProfileHikingPanel';
export { ProfileIdentityCard } from './components/profile-view/ProfileIdentityCard';
export { ProfileInfoPanel } from './components/profile-view/ProfileInfoPanel';
export { ProfilePhotoGrid } from './components/profile-view/ProfilePhotoGrid';
export { ProfileRatingSummary } from './components/profile-view/ProfileRatingSummary';
export { ProfileScreen } from './components/profile-view/ProfileScreen';
export {
  PROFILE_INFO_TAB,
  PROFILE_TABS,
  type ProfileTabDef,
  type ProfileTabId,
  ProfileTabs,
} from './components/profile-view/ProfileTabs';
export * from './hooks/useProfile';
export {
  PROFILE_BLOG_PAGE_SIZE,
  usePublicHikingSummary,
  usePublicProfile,
  useUserBlogs,
} from './hooks/usePublicProfile';
export { default as EditProfile } from './pages/EditProfile';
export { default as PublicProfile } from './pages/PublicProfile';
export { default as ViewProfile } from './pages/ViewProfile';
export { profileService } from './services/profileService';
export {
  type PublicUserProfile,
  publicProfileService,
} from './services/publicProfileService';
export * from './types';
