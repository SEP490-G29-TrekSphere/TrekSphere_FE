import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { PaymentStatus } from '@/features/payments/types';

/**
 * Manifest lịch khởi hành — phần duy nhất của nghiệp vụ booking mà luồng "hủy
 * lịch đã có khách đặt" (`vendorScheduleCancellationService`) còn cần. Tách ra
 * khỏi `features/vendor-bookings` khi màn Danh sách đơn đặt tour bị gỡ.
 *
 * Endpoint: GET /vendor/dashboard/schedules/{scheduleId}/manifest
 */
export type ScheduleBookingStatus =
  | 'PAYMENT_PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CANCELLED';

/** Booking rút gọn được nhóm từ manifest của đúng một lịch khởi hành. */
export interface ScheduleBookingItem {
  bookingId: string;
  bookingCode: string;
  numberOfParticipants: number;
  bookingStatus: ScheduleBookingStatus;
  paymentStatus: PaymentStatus;
}

/** Dữ liệu đối chiếu dùng khi Vendor hủy toàn bộ một lịch khởi hành. */
export interface ScheduleBookingManifest {
  scheduleId: string;
  bookedSlots: number;
  bookings: ScheduleBookingItem[];
}

/** BE trả thêm 'PENDING' — trạng thái trung gian được chuẩn hóa ngay khi đọc. */
type ApiBookingStatus = ScheduleBookingStatus | 'PENDING';
type ApiPaymentStatus = PaymentStatus | 'PENDING';

interface ApiManifestParticipantDto {
  bookingId?: string;
  bookingCode?: string;
  bookingStatus?: ApiBookingStatus;
  paymentStatus?: ApiPaymentStatus;
}

interface ApiScheduleManifestDto {
  scheduleId?: string;
  bookedSlots?: number;
  participants?: ApiManifestParticipantDto[];
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

function normalizePaymentStatus(status: ApiPaymentStatus): PaymentStatus {
  return status === 'PENDING' ? 'UNPAID' : status;
}

function normalizeBookingStatus(
  status: ApiBookingStatus,
  paymentStatus: PaymentStatus
): ScheduleBookingStatus {
  if (status !== 'PENDING') return status;
  return paymentStatus === 'PAID' ? 'PENDING_CONFIRMATION' : 'PAYMENT_PENDING';
}

/**
 * Lấy booking theo chính xác `scheduleId` từ manifest, sau đó nhóm các dòng
 * hành khách về một booking. Không dùng cặp ngày vì hai lịch có thể trùng ngày.
 */
export async function getScheduleBookingManifest(
  scheduleId: string
): Promise<ScheduleBookingManifest> {
  const response = await ApiService<ApiScheduleManifestDto>(
    `/vendor/dashboard/schedules/${scheduleId}/manifest`,
    'GET'
  );
  const data = unwrapResponse(response);

  if (data.scheduleId && data.scheduleId !== scheduleId) {
    throw new Error('Dữ liệu manifest không khớp lịch khởi hành cần xử lý.');
  }

  const groupedBookings = new Map<string, ScheduleBookingItem>();
  for (const participant of data.participants ?? []) {
    if (
      !participant.bookingId ||
      !participant.bookingCode ||
      !participant.bookingStatus ||
      !participant.paymentStatus
    ) {
      throw new Error('Manifest thiếu thông tin booking cần thiết để hủy lịch an toàn.');
    }

    const paymentStatus = normalizePaymentStatus(participant.paymentStatus);
    const bookingStatus = normalizeBookingStatus(participant.bookingStatus, paymentStatus);
    const current = groupedBookings.get(participant.bookingId);

    if (current) {
      if (
        current.bookingCode !== participant.bookingCode ||
        current.bookingStatus !== bookingStatus ||
        current.paymentStatus !== paymentStatus
      ) {
        throw new Error('Manifest có dữ liệu không đồng nhất trong cùng một booking.');
      }
      current.numberOfParticipants += 1;
      continue;
    }

    groupedBookings.set(participant.bookingId, {
      bookingId: participant.bookingId,
      bookingCode: participant.bookingCode,
      numberOfParticipants: 1,
      bookingStatus,
      paymentStatus,
    });
  }

  return {
    scheduleId: data.scheduleId ?? scheduleId,
    bookedSlots: data.bookedSlots ?? 0,
    bookings: [...groupedBookings.values()],
  };
}
