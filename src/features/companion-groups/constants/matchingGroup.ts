import type {
  JoinApplicationStatus,
  JourneyDifficulty,
  MatchingGroupStatus,
  MatchingMemberRole,
} from '../types/matchingGroup';

export const MATCHING_GROUP_PAGE_SIZE = 9;
export const MATCHING_GROUP_APPLICATION_PAGE_SIZE = 10;
export const MATCHING_GROUP_LOOKUP_PAGE_SIZE = 100;
export const MATCHING_GROUP_TOUR_FILTER_PAGE_SIZE = 50;
export const MATCHING_GROUP_SEARCH_DEBOUNCE_MS = 400;
export const MATCHING_GROUP_FEEDBACK_DURATION_MS = 3_500;
export const MATCHING_GROUP_LEAVE_REDIRECT_DELAY_MS = 1_200;
export const MATCHING_GROUP_DESCRIPTION_MAX_LENGTH = 2_000;
export const MATCHING_GROUP_APPLICATION_MESSAGE_MAX_LENGTH = 500;
export const MATCHING_GROUP_NAME_MIN_LENGTH = 3;
export const MATCHING_GROUP_NAME_MAX_LENGTH = 100;
export const MATCHING_GROUP_MIN_SIZE = 2;
export const MATCHING_GROUP_MAX_SIZE = 100;
export const MATCHING_GROUP_DEFAULT_SIZE = 4;
export const MATCHING_GROUP_DEFAULT_SORT = 'createdAt-desc';

export const JOURNEY_DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Dễ (Đi bộ nhẹ nhàng, thư giãn)' },
  { value: 'MODERATE', label: 'Trung bình (Cần thể lực vừa)' },
  { value: 'HARD', label: 'Thử thách (Địa hình đèo dốc)' },
  { value: 'EXTREME', label: 'Cực hạn (Kinh nghiệm cao)' },
] as const satisfies ReadonlyArray<{ value: JourneyDifficulty; label: string }>;

export type MatchingGroupLayout = 'list' | 'grid';
export type MatchingGroupStatusFilter = MatchingGroupStatus | 'ALL';
export type MatchingGroupRoleFilter = MatchingMemberRole | 'ALL';
export type MatchingGroupApplicationStatusFilter = JoinApplicationStatus | 'ALL';

export const MATCHING_GROUP_SORT_OPTIONS = [
  { value: MATCHING_GROUP_DEFAULT_SORT, label: 'Mới nhất' },
  { value: 'targetDate-asc', label: 'Ngày đi: Sớm nhất' },
  { value: 'targetDate-desc', label: 'Ngày đi: Muộn nhất' },
  { value: 'currentSize-desc', label: 'Nhiều thành viên nhất' },
] as const;

export const MATCHING_GROUP_STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'OPEN', label: 'Đang mở' },
  { value: 'FULL', label: 'Đã đủ' },
  { value: 'CLOSED', label: 'Đã đóng' },
] as const satisfies ReadonlyArray<{ value: MatchingGroupStatusFilter; label: string }>;

export const MATCHING_GROUP_ROLE_TABS = [
  { key: 'ALL', label: 'Tất cả nhóm' },
  { key: 'LEADER', label: 'Nhóm tôi làm trưởng' },
  { key: 'MEMBER', label: 'Nhóm tôi tham gia' },
] as const satisfies ReadonlyArray<{ key: MatchingGroupRoleFilter; label: string }>;

export const MATCHING_GROUP_APPLICATION_STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả trạng thái' },
  { key: 'PENDING', label: 'Đang chờ duyệt' },
  { key: 'ACCEPTED', label: 'Đã chấp nhận' },
  { key: 'REJECTED', label: 'Bị từ chối' },
  { key: 'WITHDRAWN', label: 'Đã rút' },
] as const satisfies ReadonlyArray<{
  key: MatchingGroupApplicationStatusFilter;
  label: string;
}>;

interface StatusMeta {
  label: string;
  className: string;
}

export const MATCHING_GROUP_STATUS_META = {
  OPEN: { label: 'Đang mở', className: 'bg-emerald-500/90 text-white' },
  FULL: { label: 'Đã đủ', className: 'bg-amber-500/90 text-white' },
  CLOSED: { label: 'Đã đóng', className: 'bg-muted-foreground text-background' },
  HIDDEN: { label: 'Ẩn', className: 'bg-muted-foreground/80 text-background' },
  IN_PROGRESS: { label: 'Đang diễn ra', className: 'bg-sky-500/90 text-white' },
  COMPLETED: { label: 'Đã hoàn thành', className: 'bg-blue-700/90 text-white' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-destructive/90 text-white' },
} as const satisfies Record<MatchingGroupStatus, StatusMeta>;

export const MATCHING_GROUP_APPLICATION_STATUS_META = {
  PENDING: {
    label: 'Đang chờ duyệt',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  ACCEPTED: {
    label: 'Đã chấp nhận',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  REJECTED: {
    label: 'Bị từ chối',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
  },
  WITHDRAWN: {
    label: 'Đã rút',
    className: 'border-border bg-muted text-muted-foreground',
  },
} as const satisfies Record<JoinApplicationStatus, StatusMeta>;
