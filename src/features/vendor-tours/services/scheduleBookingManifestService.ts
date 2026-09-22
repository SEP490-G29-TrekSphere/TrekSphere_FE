import { type ApiResponse, ApiService } from '@/config/apiClient';
import type { PaymentStatus } from '@/features/payments/types';

export type ScheduleBookingStatus =
  | 'PAYMENT_PENDING'
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REJECTED'
  | 'CANCELLED';

export interface ScheduleBookingItem {
  bookingId: string;
  bookingCode: string;
  numberOfParticipants: number;
  bookingStatus: ScheduleBookingStatus;
  paymentStatus: PaymentStatus;
}

export interface ScheduleBookingManifest {
  scheduleId: string;
  bookedSlots: number;
  bookings: ScheduleBookingItem[];
}

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
