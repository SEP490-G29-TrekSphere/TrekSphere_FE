import { type ApiResponse, ApiService } from '@/config/apiClient';
import type {
  PaginationVoucherResponse,
  ValidateVoucherRequest,
  VendorActiveVouchersFilter,
  VoucherValidationResponse,
} from '../types';

export const vendorVoucherService = {
  /**
   * Lấy danh sách các mã giảm giá đang kích hoạt của Vendor.
   * Endpoint: GET /vouchers/vendor/{vendorId}
   */
  async getActiveVouchersByVendor(
    vendorId: string,
    filter: VendorActiveVouchersFilter
  ): Promise<PaginationVoucherResponse> {
    const params: Record<string, string> = {};

    if (filter.discountType) {
      params.discountType = filter.discountType;
    }
    if (filter.keyword) {
      params.keyword = filter.keyword;
    }
    if (filter.page !== undefined && filter.page !== null) {
      params.page = String(filter.page);
    }
    if (filter.size !== undefined && filter.size !== null) {
      params.size = String(filter.size);
    }
    if (filter.sortBy) {
      params.sortBy = filter.sortBy;
    }
    if (filter.sortDir) {
      params.sortDir = filter.sortDir;
    }

    const response: ApiResponse<PaginationVoucherResponse> =
      await ApiService<PaginationVoucherResponse>(
        `/vouchers/vendor/${vendorId}`,
        'GET',
        undefined,
        params
      );

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Không nhận được dữ liệu từ máy chủ');
    }

    return response.data;
  },

  /**
   * Kiểm tra tính hợp lệ của mã giảm giá khi Trekker nhập đặt tour.
   * Endpoint: POST /vouchers/validate
   */
  async validateVoucher(data: ValidateVoucherRequest): Promise<VoucherValidationResponse> {
    const response: ApiResponse<VoucherValidationResponse> =
      await ApiService<VoucherValidationResponse>('/vouchers/validate', 'POST', data);

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error(response.message || 'Không thể kiểm tra mã giảm giá');
    }

    return response.data;
  },
};
