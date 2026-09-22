
export type MomentVisibility = 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME';

export type MomentStatus = 'VISIBLE' | 'HIDDEN' | 'ACTIVE';

export type MomentViewMode = 'timeline' | 'album' | 'map';

export interface MomentMediaItem {
  momentMediaId?: string;
  mediaId?: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  sortOrder?: number;
  sequenceOrder?: number;
  createdAt?: string;
}

export interface MomentItem {
  momentId: string;
  userId?: string;
  authorUserId?: string;
  authorName: string;
  authorAvatarUrl?: string;
  matchingGroupId?: string;
  caption?: string;
  placeName?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  altitude?: string;
  status: MomentStatus;
  hiddenReason?: string;
  visibility: MomentVisibility;
  mediaList: MomentMediaItem[];
  likesCount?: number;
  commentsCount?: number;
  createdAt: string;
  isLikedByCurrentUser?: boolean;
}

export interface MomentCreatePayload {
  caption?: string;
  placeName?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  altitude?: string;
  visibility?: MomentVisibility;
  mediaUrls: string[];
}

export interface MomentMapMarker {
  momentId: string;
  placeName?: string;
  locationName?: string;
  latitude: number;
  longitude: number;
  altitude?: string;
  thumbnailUrl: string;
  caption?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  createdAt: string;
}

export interface MomentPaginationResponse<T = MomentItem> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
}

export type MomentScope = 'group' | 'personal';
