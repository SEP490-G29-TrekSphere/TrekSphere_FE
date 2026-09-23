import { type ApiResponse, ApiService, ApiUpload } from '@/config/apiClient';
import type {
  ApiDifficulty,
  ApiStatus,
  CreatedTour,
  CreateTourPayload,
  TourCheckpointPayload,
  UpdateTourPayload,
  VendorTourCheckpoint,
  VendorTourDetail,
  VendorTourFilter,
  VendorTourListItem,
  VendorTourListResponse,
} from '../types';

interface VendorTourResponseDto {
  tourId: string;
  tourName: string;
  price: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  coverImageUrl: string | null;
  createdAt: string;
}

interface TourDetailResponseDto {
  tourId: string;
  status: ApiStatus;
}

interface TourCheckpointResponseDto {
  checkpointId: string;
}

interface PaginationResponseDto<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

function toFormData(
  fields: Record<string, string | number | boolean | File | undefined | null>
): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    formData.append(key, value instanceof File ? value : String(value));
  }
  return formData;
}

function participationPolicyFields(
  policy: CreateTourPayload['participationPolicy']
): Record<string, string | number | boolean | undefined> {
  return {
    'participationPolicy.minAge': policy.minAge,
    'participationPolicy.maxAge': policy.maxAge,
    'participationPolicy.fitnessLevel': policy.fitnessLevel,
    'participationPolicy.healthRequirements': policy.healthRequirements,
    'participationPolicy.restrictedMedicalConditions': policy.restrictedMedicalConditions,
    'participationPolicy.requiredExperience': policy.requiredExperience,
    'participationPolicy.requiredSkills': policy.requiredSkills,
    'participationPolicy.requiredEquipment': policy.requiredEquipment,
    'participationPolicy.requiredDocuments': policy.requiredDocuments,
    'participationPolicy.requiresHealthDeclaration': policy.requiresHealthDeclaration,
    'participationPolicy.requiresMedicalCertificate': policy.requiresMedicalCertificate,
    'participationPolicy.guardianRequiredUnderAge': policy.guardianRequiredUnderAge,
    'participationPolicy.additionalRequirements': policy.additionalRequirements,
  };
}

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) {
    throw new Error(response.error);
  }
  if (response.data === undefined) {
    throw new Error('Không nhận được dữ liệu từ máy chủ');
  }
  return response.data;
}

function mapVendorTour(dto: VendorTourResponseDto): VendorTourListItem {
  return {
    id: dto.tourId,
    name: dto.tourName,
    coverImageUrl: dto.coverImageUrl ?? undefined,
    price: dto.price,
    difficulty: dto.difficulty,
    status: dto.status,
    createdAt: dto.createdAt,
  };
}

export const vendorTourService = {

  async listMyTours(
    filter: VendorTourFilter = {},
    page = 1,
    pageSize = 10
  ): Promise<VendorTourListResponse> {
    const params: Record<string, string> = {
      page: String(page - 1),
      size: String(pageSize),
    };
    if (filter.search) {
      params.keyword = filter.search;
    }

    const response = await ApiService<PaginationResponseDto<VendorTourResponseDto>>(
      '/vendor/tours',
      'GET',
      undefined,
      params
    );
    const data = unwrapResponse(response);

    return {
      tours: data.content.map(mapVendorTour),
      total: data.totalElements,
      page,
      pageSize,
    };
  },

  async createTour(payload: CreateTourPayload): Promise<CreatedTour> {
    const formData = toFormData({
      tourName: payload.tourName,
      description: payload.description,
      difficulty: payload.difficulty,
      location: payload.location,
      durationDays: payload.durationDays,
      price: payload.price,
      minCapacity: payload.minCapacity,
      maxCapacity: payload.maxCapacity,
      totalDistanceKm: payload.totalDistanceKm,
      highlights: payload.highlights,
      includes: payload.includes,
      excludes: payload.excludes,
      coverImageUrl: payload.coverImageUrl,
      coverImage: payload.coverImage,
      ...participationPolicyFields(payload.participationPolicy),
    });
    const response = await ApiUpload<TourDetailResponseDto>('/vendor/tours', formData);
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  async getTourDetail(tourId: string): Promise<VendorTourDetail> {
    const response = await ApiService<VendorTourDetail>(`/vendor/tours/${tourId}`, 'GET');
    return unwrapResponse(response);
  },

  async updateTour(tourId: string, payload: UpdateTourPayload): Promise<CreatedTour> {
    const formData = toFormData({
      tourName: payload.tourName,
      description: payload.description,
      difficulty: payload.difficulty,
      location: payload.location,
      durationDays: payload.durationDays,
      price: payload.price,
      minCapacity: payload.minCapacity,
      maxCapacity: payload.maxCapacity,
      totalDistanceKm: payload.totalDistanceKm,
      highlights: payload.highlights,
      includes: payload.includes,
      excludes: payload.excludes,
      coverImageUrl: payload.coverImageUrl,
      coverImage: payload.coverImage,
      ...participationPolicyFields(payload.participationPolicy),
    });
    const response = await ApiUpload<TourDetailResponseDto>(
      `/vendor/tours/${tourId}`,
      formData,
      'PUT'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  async createCheckpoint(tourId: string, payload: TourCheckpointPayload): Promise<void> {
    const formData = toFormData({
      checkpointName: payload.checkpointName,
      description: payload.description,
      checkpointOrder: payload.checkpointOrder,
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude,
      checkpointImageUrl: payload.checkpointImageUrl,
    });
    const response = await ApiUpload<TourCheckpointResponseDto>(
      `/vendor/tours/${tourId}/checkpoints`,
      formData
    );
    unwrapResponse(response);
  },

  async getCheckpoints(tourId: string): Promise<VendorTourCheckpoint[]> {
    const response = await ApiService<VendorTourCheckpoint[]>(
      `/tours/${tourId}/checkpoints`,
      'GET'
    );
    return unwrapResponse(response);
  },

  async updateCheckpoint(checkpointId: string, payload: TourCheckpointPayload): Promise<void> {
    const formData = toFormData({
      checkpointName: payload.checkpointName,
      description: payload.description,
      checkpointOrder: payload.checkpointOrder,
      latitude: payload.latitude,
      longitude: payload.longitude,
      altitude: payload.altitude,
      checkpointImageUrl: payload.checkpointImageUrl,
    });
    const response = await ApiUpload<TourCheckpointResponseDto>(
      `/vendor/tours/checkpoints/${checkpointId}`,
      formData,
      'PUT'
    );
    unwrapResponse(response);
  },

  async deleteCheckpoint(checkpointId: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/tours/checkpoints/${checkpointId}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async deleteTour(tourId: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/tours/${tourId}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async publishTour(tourId: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/publish`,
      'PUT'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  async unpublishTour(tourId: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/unpublish`,
      'PUT'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },

  async restoreTour(tourId: string): Promise<CreatedTour> {
    const response = await ApiService<TourDetailResponseDto>(
      `/vendor/tours/${tourId}/restore`,
      'POST'
    );
    const data = unwrapResponse(response);
    return { id: data.tourId, status: data.status };
  },
};
