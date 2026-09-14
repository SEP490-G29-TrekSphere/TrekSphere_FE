import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { PaginationResponse } from '../types/matchingGroup';
import type { CreateSosAlertPayload, SosAlertResponse } from '../types/sos';

function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (response.error) throw new Error(response.error);
  if (response.data === undefined || response.data === null) {
    throw new Error(response.message ?? 'Phản hồi từ máy chủ không có dữ liệu.');
  }
  return response.data;
}

export const sosService = {
  /** Phát tín hiệu SOS mới trong Group Trip đang diễn ra. */
  async createSosAlert(groupId: string, payload: CreateSosAlertPayload): Promise<SosAlertResponse> {
    const response = await ApiService<SosAlertResponse>(
      `/matching-groups/${groupId}/sos-alerts`,
      'POST',
      payload
    );
    return unwrapResponse(response);
  },

  /** Danh sách tín hiệu SOS đang mở (OPEN) của nhóm. */
  async getActiveSosAlerts(groupId: string): Promise<SosAlertResponse[]> {
    const response = await ApiService<SosAlertResponse[]>(
      `/matching-groups/${groupId}/sos-alerts/active`,
      'GET'
    );
    return unwrapResponse(response);
  },

  /** Lịch sử tín hiệu SOS của nhóm (phân trang). */
  async getSosAlertHistory(
    groupId: string,
    page = 0,
    size = 10
  ): Promise<PaginationResponse<SosAlertResponse>> {
    const response = await ApiService<PaginationResponse<SosAlertResponse>>(
      `/matching-groups/${groupId}/sos-alerts`,
      'GET',
      undefined,
      { page: String(page), size: String(size) }
    );
    return unwrapResponse(response);
  },

  /** Đóng tín hiệu SOS (Sender của chính alert đó, hoặc Leader). */
  async resolveSosAlert(groupId: string, sosAlertId: string): Promise<SosAlertResponse> {
    const response = await ApiService<SosAlertResponse>(
      `/matching-groups/${groupId}/sos-alerts/${sosAlertId}/resolve`,
      'PATCH'
    );
    return unwrapResponse(response);
  },
};
