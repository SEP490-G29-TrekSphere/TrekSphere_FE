// src/features/vendor-tours/types.ts

import type {
  ApiDifficulty,
  ApiStatus,
  TourDetailFromApi,
  TourDetailScheduleApi,
} from '@/features/tours/types';

export type { ApiDifficulty, ApiStatus };

export type VendorTourDetail = TourDetailFromApi;

export interface VendorTourListItem {
  id: string;
  name: string;
  coverImageUrl?: string;
  price: number;
  difficulty: ApiDifficulty;
  status: ApiStatus;
  createdAt: string;
}

export interface VendorTourFilter {
  search?: string;
}

export interface VendorTourListResponse {
  tours: VendorTourListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateTourPayload {
  tourName: string;
  description: string;
  difficulty: ApiDifficulty;
  location: string;
  durationDays: number;
  price: number;
  minCapacity: number;
  maxCapacity: number;
  totalDistanceKm?: number;
  highlights?: string;
  includes?: string;
  excludes?: string;

  coverImageUrl?: string;

  coverImage?: File;
  participationPolicy: {
    minAge: number;
    maxAge?: number;
    fitnessLevel: 'ANY' | 'BASIC' | 'MODERATE' | 'HIGH' | 'EXTREME';
    healthRequirements?: string;
    restrictedMedicalConditions?: string;
    requiredExperience?: string;
    requiredSkills?: string;
    requiredEquipment?: string;
    requiredDocuments?: string;
    requiresHealthDeclaration: boolean;
    requiresMedicalCertificate: boolean;
    guardianRequiredUnderAge?: number;
    additionalRequirements?: string;
  };
}

export type UpdateTourPayload = CreateTourPayload;

export interface TourCheckpointPayload {
  checkpointName: string;
  description?: string;
  checkpointOrder: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;

  checkpointImageUrl?: string;
}

export interface VendorTourCheckpoint extends TourCheckpointPayload {
  checkpointId: string;
  tourId: string;

  checkpointImageUrls?: string[];
}

export interface CheckpointSubmitItem {
  checkpointId?: string;
  payload: TourCheckpointPayload;
}

export interface CreatedTour {
  id: string;
  status: ApiStatus;
}

export type ApiScheduleStatus = TourDetailScheduleApi['status'];

export type TourSchedule = TourDetailScheduleApi;

export interface CreateSchedulePayload {
  departureDate: string;
  returnDate: string;

  availableSlots: number;
}

export interface UpdateSchedulePayload {
  departureDate?: string;
  returnDate?: string;

  availableSlots?: number;
  status?: ApiScheduleStatus;

  reason?: string;
}
