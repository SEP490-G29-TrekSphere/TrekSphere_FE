export const PATHS = {
  // Auth
  VERIFY_EMAIL: '/verify',

  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  ABOUT: '/about',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  CONTACT: '/contact',

  DASHBOARD: '/dashboard',
  TOURS: '/tours',
  TOUR_DETAIL: '/tours/:id',

  VENDOR_PUBLIC_PROFILE: '/vendors/:vendorId',
  MY_VENDOR_APPLICATIONS: '/my-vendor-applications',
  GROUPS: '/groups',
  GROUPS_CREATE: '/groups/create',
  GROUPS_JOIN: '/groups/:groupId/join',
  GROUPS_DETAIL: '/groups/:groupId',
  COMMUNITY: '/groups',
  NEWS: '/news',
  NEWS_DETAIL: '/news/:blogId',
  NOTIFICATIONS: '/notifications',
  CHAT: '/chat',

  // Settings
  SETTINGS: '/settings',
  CHANGE_PASSWORD: '/settings/change-password',

  // Profile
  PROFILE: '/profile',
  PUBLIC_PROFILE: '/profile/user/:userId',
  EDIT_PROFILE: '/profile/edit',

  USER_PROFILE: '/users/:userId',
  // Trekker Community / Blog
  BLOG_LIST: '/blog',
  BLOG_CREATE: '/blog/create',
  BLOG_EDIT: '/blog/edit/:blogId',

  // Trekker portal
  TREKKER: '/trekker',
  TREKKER_PROFILE: '/trekker/profile',
  TREKKER_PROFILE_EDIT: '/trekker/profile/edit',
  TREKKER_MY_GROUPS: '/trekker/my-groups',
  TREKKER_GROUP_DETAIL: '/trekker/my-groups/:groupId',
  TREKKER_GROUPS_JOIN: '/trekker/my-groups/:groupId/join',
  TREKKER_MY_JOIN_REQUESTS: '/trekker/my-join-requests',
  TREKKER_VENDOR_APPLICATIONS: '/trekker/vendor-applications',
  TREKKER_BLOG_LIST: '/trekker/blog',
  TREKKER_BLOG_CREATE: '/trekker/blog/create',
  TREKKER_BLOG_EDIT: '/trekker/blog/edit/:blogId',
  TREKKER_CHANGE_PASSWORD: '/trekker/change-password',
  TREKKER_CHAT: '/trekker/chat',
  TREKKER_NOTIFICATIONS: '/trekker/notifications',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_ACCOUNTS: '/admin/accounts',
  ADMIN_ACCOUNT_DETAIL: '/admin/accounts/:id',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_TOURS: '/admin/tours',
  ADMIN_DATA: '/admin/data',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_APPLICATION_DETAIL: '/admin/applications/:id',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_REPORT_DETAIL: '/admin/reports/:id',
  ADMIN_EMERGENCY: '/admin/emergency',
  ADMIN_CHAT: '/admin/chat',
  ADMIN_NOTIFICATIONS: '/admin/notifications',

  // Vendor portal (unified)
  VENDOR: '/vendor',
  VENDOR_PROFILE: '/vendor/profile',
  VENDOR_PROFILE_EDIT: '/vendor/profile/edit',
  VENDOR_TOURS: '/vendor/tours',
  VENDOR_TOUR_CREATE: '/vendor/tours/new',
  VENDOR_TOUR_EDIT: '/vendor/tours/:id/edit',
  VENDOR_TOUR_PREVIEW: '/vendor/tours/:id/preview',
  VENDOR_TOUR_STATISTICS: '/vendor/tours/statistics',
  VENDOR_TOUR_SCHEDULES: '/vendor/tours/:id/schedules',
  VENDOR_BLOG_LIST: '/vendor/blog',
  VENDOR_BLOG_CREATE: '/vendor/blog/create',
  VENDOR_BLOG_EDIT: '/vendor/blog/edit/:blogId',
  VENDOR_CHAT: '/vendor/chat',
  VENDOR_NOTIFICATIONS: '/vendor/notifications',

  // Vendor Manager (Legacy - redirected to /vendor)
  VENDOR_MANAGER: '/vendor-manager',
  VENDOR_MANAGER_PROFILE: '/vendor/profile',
  VENDOR_MANAGER_PROFILE_EDIT: '/vendor/profile/edit',
  VENDOR_MANAGER_STAFF: '/vendor/staff',
  VENDOR_MANAGER_TOURS: '/vendor/tours',
  VENDOR_MANAGER_TOUR_CREATE: '/vendor/tours/new',
  VENDOR_MANAGER_TOUR_EDIT: '/vendor/tours/:id/edit',
  VENDOR_MANAGER_TOUR_SCHEDULES: '/vendor/tours/:id/schedules',
  VENDOR_MANAGER_EMERGENCY: '/vendor/emergency',
  VENDOR_MANAGER_CHAT: '/vendor/chat',

  // Vendor Staff (Legacy - redirected to /vendor)
  PARTNER: '/partner',
  PARTNER_PROFILE: '/vendor/profile',
  PARTNER_TOURS: '/vendor/tours',
  PARTNER_TOUR_CREATE: '/vendor/tours/new',
  PARTNER_TOUR_EDIT: '/vendor/tours/:id/edit',
  PARTNER_TOUR_SCHEDULES: '/vendor/tours/:id/schedules',
  PARTNER_BLOG_CREATE: '/vendor/blog/create',
  PARTNER_CHAT: '/vendor/chat',

  // Admin — Blog moderation
  ADMIN_BLOGS: '/admin/blogs',
} as const;

export type AppPath = (typeof PATHS)[keyof typeof PATHS];

export const getGroupDetailPath = (groupId: string) =>
  PATHS.GROUPS_DETAIL.replace(':groupId', groupId);
export const getGroupJoinPath = (groupId: string) => PATHS.GROUPS_JOIN.replace(':groupId', groupId);
export const getVendorTourEditPath = (id: string) => PATHS.VENDOR_TOUR_EDIT.replace(':id', id);
export const getVendorTourPreviewPath = (id: string) =>
  PATHS.VENDOR_TOUR_PREVIEW.replace(':id', id);
export const getVendorManagerTourEditPath = (id: string) =>
  PATHS.VENDOR_TOUR_EDIT.replace(':id', id);
export const getPartnerTourEditPath = (id: string) => PATHS.VENDOR_TOUR_EDIT.replace(':id', id);
export const getVendorTourSchedulesPath = (id: string) =>
  PATHS.VENDOR_TOUR_SCHEDULES.replace(':id', id);
export const getVendorManagerTourSchedulesPath = (id: string) =>
  PATHS.VENDOR_TOUR_SCHEDULES.replace(':id', id);
export const getPartnerTourSchedulesPath = (id: string) =>
  PATHS.VENDOR_TOUR_SCHEDULES.replace(':id', id);
export const getNewsDetailPath = (blogId: string) => PATHS.NEWS_DETAIL.replace(':blogId', blogId);
export const getUserProfilePath = (userId?: string | null) =>
  userId ? PATHS.USER_PROFILE.replace(':userId', userId) : '#';
export const getVendorPublicProfilePath = (vendorId: string) =>
  PATHS.VENDOR_PUBLIC_PROFILE.replace(':vendorId', vendorId);
export const getTrekkerBlogEditPath = (blogId: string) =>
  PATHS.TREKKER_BLOG_EDIT.replace(':blogId', blogId);
export const getVendorBlogEditPath = (blogId: string) =>
  PATHS.VENDOR_BLOG_EDIT.replace(':blogId', blogId);
export const getTrekkerGroupDetailPath = (groupId: string) =>
  PATHS.TREKKER_GROUP_DETAIL.replace(':groupId', groupId);
export const getTrekkerGroupJoinPath = (groupId: string) =>
  PATHS.TREKKER_GROUPS_JOIN.replace(':groupId', groupId);
