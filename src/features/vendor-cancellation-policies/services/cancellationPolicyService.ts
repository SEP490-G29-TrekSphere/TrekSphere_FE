import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { CancellationPolicy, CancellationPolicyPayload } from '../types';

interface CancellationPolicyResponseDto {
  cancellationPolicyId: string;
  cancelBeforeDays: number;
  refundPercentage: number;
  description?: string | null;
  isActive: boolean;
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

function mapPolicy(dto: CancellationPolicyResponseDto): CancellationPolicy {
  return {
    cancellationPolicyId: dto.cancellationPolicyId,
    cancelBeforeDays: dto.cancelBeforeDays,
    refundPercentage: dto.refundPercentage,
    description: dto.description ?? undefined,
    isActive: dto.isActive,
  };
}

export const cancellationPolicyService = {

  async list(): Promise<CancellationPolicy[]> {
    const response = await ApiService<CancellationPolicyResponseDto[]>(
      '/vendor/cancellation-policies',
      'GET'
    );
    return (unwrapResponse(response) ?? []).map(mapPolicy);
  },

  async create(payload: CancellationPolicyPayload): Promise<CancellationPolicy> {
    const response = await ApiService<CancellationPolicyResponseDto>(
      '/vendor/cancellation-policies',
      'POST',
      payload
    );
    return mapPolicy(unwrapResponse(response));
  },

  async update(id: string, payload: CancellationPolicyPayload): Promise<CancellationPolicy> {
    const response = await ApiService<CancellationPolicyResponseDto>(
      `/vendor/cancellation-policies/${id}`,
      'PUT',
      payload
    );
    return mapPolicy(unwrapResponse(response));
  },

  async remove(id: string): Promise<void> {
    const response = await ApiService<void>(`/vendor/cancellation-policies/${id}`, 'DELETE');
    if (response.error) {
      throw new Error(response.error);
    }
  },
};
