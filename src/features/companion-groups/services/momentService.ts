import { type ApiResponse, ApiService } from '@/config/apiClient';

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
  status: 'VISIBLE' | 'HIDDEN' | 'ACTIVE';
  hiddenReason?: string;
  visibility: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME';
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
  visibility?: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME';
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

export interface BackendPagination<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface MomentPaginationResponse<T = MomentItem> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
}

interface RawMomentMedia {
  momentMediaId?: string;
  mediaId?: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  sortOrder?: number;
  sequenceOrder?: number;
  createdAt?: string;
}

interface RawMomentItem {
  momentId?: string;
  id?: string;
  userId?: string;
  authorUserId?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  matchingGroupId?: string;
  caption?: string;
  placeName?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  altitude?: string;
  status?: 'VISIBLE' | 'HIDDEN' | 'ACTIVE';
  hiddenReason?: string;
  visibility?: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME';
  mediaList?: RawMomentMedia[];
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  isLikedByCurrentUser?: boolean;
  thumbnailUrl?: string;
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message ?? 'Phản hồi từ máy chủ không có dữ liệu.');
  }
  return response.data;
}

function mapRawToMomentItem(m: RawMomentItem): MomentItem {
  const mediaList: MomentMediaItem[] = Array.isArray(m.mediaList)
    ? m.mediaList.map((med) => ({
        mediaId: med.momentMediaId || med.mediaId || '',
        momentMediaId: med.momentMediaId || med.mediaId,
        mediaUrl: med.imageUrl || med.mediaUrl || '',
        imageUrl: med.imageUrl || med.mediaUrl,
        mediaType: med.mediaType || 'IMAGE',
        sortOrder: med.sortOrder ?? med.sequenceOrder ?? 0,
        sequenceOrder: med.sequenceOrder ?? med.sortOrder ?? 0,
        createdAt: med.createdAt,
      }))
    : [];

  return {
    momentId: m.momentId || m.id || '',
    userId: m.authorUserId || m.userId || '',
    authorUserId: m.authorUserId || m.userId,
    authorName: m.authorName || 'Thành viên',
    authorAvatarUrl: m.authorAvatarUrl,
    matchingGroupId: m.matchingGroupId,
    caption: m.caption,
    locationName: m.placeName || m.locationName || 'Tọa độ hành trình',
    placeName: m.placeName || m.locationName,
    latitude: m.latitude,
    longitude: m.longitude,
    altitude: m.altitude,
    status: m.status || 'VISIBLE',
    hiddenReason: m.hiddenReason,
    visibility: m.visibility || 'GROUP_ONLY',
    likesCount: m.likesCount ?? 0,
    commentsCount: m.commentsCount ?? 0,
    createdAt: m.createdAt || new Date().toISOString(),
    isLikedByCurrentUser: m.isLikedByCurrentUser ?? false,
    mediaList,
  };
}

export const momentService = {
  async getGroupMoments(
    groupId: string,
    page = 0,
    size = 20
  ): Promise<MomentPaginationResponse<MomentItem>> {
    const res = await ApiService<BackendPagination<RawMomentItem> | RawMomentItem[]>(
      `/matching-groups/${groupId}/moments`,
      'GET',
      undefined,
      { page: String(page), size: String(size) }
    );
    const data = unwrapResponse(res);
    const rawList: RawMomentItem[] = Array.isArray(data)
      ? data
      : Array.isArray((data as BackendPagination<RawMomentItem>)?.content)
        ? (data as BackendPagination<RawMomentItem>).content
        : [];
    const items: MomentItem[] = rawList.map(mapRawToMomentItem);
    const pageData = data as BackendPagination<RawMomentItem>;
    return {
      items,
      page: pageData?.pageNumber ?? page,
      size: pageData?.pageSize ?? size,
      totalElements: pageData?.totalElements ?? items.length,
      totalPages: pageData?.totalPages ?? 1,
      hasMore: pageData ? !pageData.last : false,
    };
  },

  async createGroupMoment(groupId: string, payload: MomentCreatePayload): Promise<MomentItem> {
    const body = {
      caption: payload.caption,
      placeName: payload.placeName || payload.locationName,
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude,
      visibility: payload.visibility,
      mediaUrls: payload.mediaUrls,
    };
    const res = await ApiService<RawMomentItem>(
      `/matching-groups/${groupId}/moments`,
      'POST',
      body
    );
    const m = unwrapResponse(res);
    return mapRawToMomentItem(m);
  },

  async getGroupAlbum(
    groupId: string,
    page = 0,
    size = 50
  ): Promise<MomentPaginationResponse<MomentMediaItem>> {
    const res = await ApiService<BackendPagination<RawMomentMedia> | RawMomentMedia[]>(
      `/matching-groups/${groupId}/moments/album`,
      'GET',
      undefined,
      { page: String(page), size: String(size) }
    );
    const data = unwrapResponse(res);
    const rawList: RawMomentMedia[] = Array.isArray(data)
      ? data
      : Array.isArray((data as BackendPagination<RawMomentMedia>)?.content)
        ? (data as BackendPagination<RawMomentMedia>).content
        : [];
    const items: MomentMediaItem[] = rawList.map((med) => ({
      mediaId: med.momentMediaId || med.mediaId || '',
      momentMediaId: med.momentMediaId || med.mediaId,
      mediaUrl: med.imageUrl || med.mediaUrl || '',
      imageUrl: med.imageUrl || med.mediaUrl,
      mediaType: med.mediaType || 'IMAGE',
      sortOrder: med.sortOrder ?? med.sequenceOrder ?? 0,
      createdAt: med.createdAt,
    }));
    const pageData = data as BackendPagination<RawMomentMedia>;
    return {
      items,
      page: pageData?.pageNumber ?? page,
      size: pageData?.pageSize ?? size,
      totalElements: pageData?.totalElements ?? items.length,
      totalPages: pageData?.totalPages ?? 1,
      hasMore: pageData ? !pageData.last : false,
    };
  },

  async getGroupMomentsMap(groupId: string): Promise<MomentMapMarker[]> {
    const res = await ApiService<RawMomentItem[]>(`/matching-groups/${groupId}/moments/map`, 'GET');
    const data = unwrapResponse(res);
    const list = Array.isArray(data) ? data : [];
    return list.map((m) => ({
      momentId: m.momentId || m.id || '',
      latitude: m.latitude ?? 0,
      longitude: m.longitude ?? 0,
      altitude: m.altitude,
      locationName: m.placeName || m.locationName || 'Tọa độ hành trình',
      placeName: m.placeName || m.locationName || 'Tọa độ hành trình',
      authorName: m.authorName,
      authorAvatarUrl: m.authorAvatarUrl,
      thumbnailUrl:
        m.thumbnailUrl || (Array.isArray(m.mediaList) && m.mediaList[0]?.imageUrl) || '',
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  },

  async hideMoment(groupId: string, momentId: string, reason: string): Promise<MomentItem> {
    const res = await ApiService<RawMomentItem>(
      `/matching-groups/${groupId}/moments/${momentId}/hide`,
      'POST',
      { hiddenReason: reason, reason }
    );
    const m = unwrapResponse(res);
    return mapRawToMomentItem(m);
  },

  async unhideMoment(groupId: string, momentId: string): Promise<MomentItem> {
    const res = await ApiService<RawMomentItem>(
      `/matching-groups/${groupId}/moments/${momentId}/unhide`,
      'POST'
    );
    const m = unwrapResponse(res);
    return mapRawToMomentItem(m);
  },

  async deleteMoment(groupId: string, momentId: string): Promise<void> {
    const res = await ApiService<void>(`/matching-groups/${groupId}/moments/${momentId}`, 'DELETE');
    unwrapResponse(res);
  },

  async updateMomentVisibility(
    groupId: string,
    momentId: string,
    visibility: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME'
  ): Promise<MomentItem> {
    const res = await ApiService<RawMomentItem>(
      `/matching-groups/${groupId}/moments/${momentId}/visibility`,
      'PATCH',
      { visibility }
    );
    const m = unwrapResponse(res);
    return mapRawToMomentItem(m);
  },
};
