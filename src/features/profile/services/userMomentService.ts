import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  MomentItem,
  MomentMapMarker,
  MomentPaginationResponse,
} from '@/features/companion-groups/services/momentService';

export interface UserMomentCreatePayload {
  caption?: string;
  placeName?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  altitude?: string;
  visibility?: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME';
  mediaUrls: string[];
}

interface RawMomentMedia {
  momentMediaId?: string;
  mediaId?: string;
  imageUrl?: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO';
  sequenceOrder?: number;
}

interface RawMomentItem {
  momentId?: string;
  id?: string;
  userId?: string;
  authorUserId?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  caption?: string;
  placeName?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  altitude?: string;
  visibility?: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME';
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  isLikedByCurrentUser?: boolean;
  thumbnailUrl?: string;
  mediaList?: RawMomentMedia[];
}

interface RawPageData {
  content?: RawMomentItem[];
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
}

function unwrapResponse<T>(res: ApiResponse<T>): T {
  if (res.error) throw new Error(res.error);
  if (res.data === undefined || res.data === null) {
    throw new Error('Máy chủ không phản hồi dữ liệu.');
  }
  return res.data;
}

function mapRawToMomentItem(m: RawMomentItem): MomentItem {
  const mediaList = Array.isArray(m.mediaList)
    ? m.mediaList.map((med) => ({
        mediaId: med.momentMediaId || med.mediaId || '',
        momentMediaId: med.momentMediaId || med.mediaId,
        mediaUrl: med.imageUrl || med.mediaUrl || '',
        imageUrl: med.imageUrl || med.mediaUrl,
        mediaType: med.mediaType || 'IMAGE',
        sequenceOrder: med.sequenceOrder ?? 0,
      }))
    : [];

  return {
    momentId: m.momentId || m.id || '',
    userId: m.authorUserId || m.userId || '',
    authorUserId: m.authorUserId || m.userId,
    authorName: m.authorName || 'Người dùng',
    authorAvatarUrl: m.authorAvatarUrl,
    caption: m.caption,
    locationName: m.placeName || m.locationName || 'Tọa độ hành trình',
    placeName: m.placeName || m.locationName,
    latitude: m.latitude,
    longitude: m.longitude,
    altitude: m.altitude,
    visibility: m.visibility || 'PUBLIC_PROFILE',
    likesCount: m.likesCount ?? 0,
    commentsCount: m.commentsCount ?? 0,
    createdAt: m.createdAt || new Date().toISOString(),
    isLikedByCurrentUser: m.isLikedByCurrentUser ?? false,
    mediaList,
  };
}

export const userMomentService = {
  async getMyMoments(page = 0, size = 20): Promise<MomentPaginationResponse<MomentItem>> {
    const res = await ApiService<RawPageData | RawMomentItem[]>(
      '/users/me/moments',
      'GET',
      undefined,
      {
        page: String(page),
        size: String(size),
      }
    );
    const data = unwrapResponse(res);
    const rawList: RawMomentItem[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
        ? data.content
        : [];
    const pageData = Array.isArray(data) ? null : data;
    const items: MomentItem[] = rawList.map(mapRawToMomentItem);

    return {
      items,
      page: pageData?.pageNumber ?? page,
      size: pageData?.pageSize ?? size,
      totalElements: pageData?.totalElements ?? items.length,
      totalPages: pageData?.totalPages ?? 1,
      hasMore: pageData ? !pageData.last : false,
    };
  },

  async getMyMomentsMap(): Promise<MomentMapMarker[]> {
    const res = await ApiService<RawMomentItem[]>('/users/me/moments/map', 'GET');
    const data = unwrapResponse(res);
    const list = Array.isArray(data) ? data : [];
    return list.map((m) => ({
      momentId: m.momentId || m.id || '',
      latitude: m.latitude ?? 0,
      longitude: m.longitude ?? 0,
      altitude: m.altitude,
      locationName: m.placeName || m.locationName || 'Tọa độ hành trình',
      placeName: m.placeName || m.locationName || 'Tọa độ hành trình',
      thumbnailUrl:
        m.thumbnailUrl || (Array.isArray(m.mediaList) && m.mediaList[0]?.imageUrl) || '',
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  },

  async getUserPublicMoments(
    userId: string,
    page = 0,
    size = 20
  ): Promise<MomentPaginationResponse<MomentItem>> {
    const res = await ApiService<RawPageData | RawMomentItem[]>(
      `/users/${userId}/moments`,
      'GET',
      undefined,
      {
        page: String(page),
        size: String(size),
      }
    );
    const data = unwrapResponse(res);
    const rawList: RawMomentItem[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
        ? data.content
        : [];
    const pageData = Array.isArray(data) ? null : data;
    const items: MomentItem[] = rawList.map(mapRawToMomentItem);

    return {
      items,
      page: pageData?.pageNumber ?? page,
      size: pageData?.pageSize ?? size,
      totalElements: pageData?.totalElements ?? items.length,
      totalPages: pageData?.totalPages ?? 1,
      hasMore: pageData ? !pageData.last : false,
    };
  },

  async getUserPublicMomentsMap(userId: string): Promise<MomentMapMarker[]> {
    const res = await ApiService<RawMomentItem[]>(`/users/${userId}/moments/map`, 'GET');
    const data = unwrapResponse(res);
    const list = Array.isArray(data) ? data : [];
    return list.map((m) => ({
      momentId: m.momentId || m.id || '',
      latitude: m.latitude ?? 0,
      longitude: m.longitude ?? 0,
      altitude: m.altitude,
      locationName: m.placeName || m.locationName || 'Tọa độ hành trình',
      placeName: m.placeName || m.locationName || 'Tọa độ hành trình',
      thumbnailUrl:
        m.thumbnailUrl || (Array.isArray(m.mediaList) && m.mediaList[0]?.imageUrl) || '',
      createdAt: m.createdAt || new Date().toISOString(),
    }));
  },

  async createPersonalMoment(payload: UserMomentCreatePayload): Promise<MomentItem> {
    const body = {
      caption: payload.caption,
      placeName: payload.placeName || payload.locationName,
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude,
      visibility: payload.visibility || 'PUBLIC_PROFILE',
      mediaUrls: payload.mediaUrls,
    };
    const res = await ApiService<RawMomentItem>('/users/me/moments', 'POST', body);
    const m = unwrapResponse(res);
    return mapRawToMomentItem(m);
  },

  async updatePersonalMomentVisibility(
    momentId: string,
    visibility: 'GROUP_ONLY' | 'PUBLIC_PROFILE' | 'ONLY_ME'
  ): Promise<MomentItem> {
    const res = await ApiService<RawMomentItem>(
      `/users/me/moments/${momentId}/visibility`,
      'PATCH',
      {
        visibility,
      }
    );
    const m = unwrapResponse(res);
    return mapRawToMomentItem(m);
  },

  async deletePersonalMoment(momentId: string): Promise<void> {
    const res = await ApiService<void>(`/users/me/moments/${momentId}`, 'DELETE');
    unwrapResponse(res);
  },
};
