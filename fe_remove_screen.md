# Danh sách màn FE cần bỏ đi — BE không còn xử lý các nghiệp vụ booking/payment/refund/voucher/equipment/porter/coordinator

## A. Màn phía Trekker (4 màn)

### 1. Đặt tour (Book Tour)

- Route: `PATHS.BOOK_TOUR`
- Xoá cả file:
  - `src/features/tours/pages/BookTour.tsx`
  - `src/features/tours/utils/schedulePaymentOption.ts` (+ `.test.ts`)
  - `src/features/tours/utils/bookingIdempotency.ts` (+ `.test.ts`)
  - `src/features/tours/components/CancellationPolicyNotice.tsx`

### 2. Thanh toán đặt tour (Pay Booking)

- Route: `PATHS.BOOKING_PAYMENT`, `PATHS.TREKKER_BOOKING_PAYMENT`
- Xoá cả file: `src/features/tours/pages/PayBooking.tsx`

### 3. Kết quả thanh toán (Payment Return)

- Route: `PATHS.PAYMENT_SUCCESS`, `PATHS.PAYMENT_CANCEL`
- Xoá cả file: `src/features/payments/pages/PaymentReturn.tsx`

### 4. Chi tiết đơn đặt tour (Booking Detail)

- Route: `PATHS.BOOKING_DETAIL`, `PATHS.TREKKER_BOOKING_DETAIL`
- Xoá cả file:
  - `src/features/tours/pages/BookingDetail.tsx`
  - `src/features/tours/hooks/useBookingCountdown.ts` (+ `.test.ts`)
  - `src/features/tours/components/BookingSosPanel.tsx` (SOS phiên bản CŨ gắn với booking — **khác** `emergency-sos/`, xem mục E)

### 5. Lịch sử đặt tour (My Bookings)

- Route: `PATHS.MY_TOURS`, `PATHS.TREKKER_MY_TOURS`
- Xoá cả file: `src/features/tours/pages/MyBookings.tsx`

---

## B. Màn phía Vendor Manager + Vendor Staff (nhân đôi theo 2 role, cùng component dùng chung)

### 6. Danh sách đơn đặt tour

- Route: `PATHS.VENDOR_MANAGER_BOOKINGS`, `PATHS.PARTNER_BOOKINGS`
- Xoá cả file (toàn bộ `vendor-bookings/`, 15 file): `BookingList.tsx`, `BookingDetailModal.tsx`, `BookingFilterBar.tsx`, `BookingStatsCards.tsx`, `BookingTableRow.tsx`, `ConfirmBookingModal.tsx`, `RejectBookingModal.tsx`, `useConfirmBooking.ts`, `useRejectBooking.ts`, `useVendorBookingStats.ts`, `useVendorBookings.ts`, `vendorBookingService.ts` (+`.test.ts`), `types.ts`, `bookingCustomer.ts`

### 7. Cấu hình thanh toán Vendor

- Route: `PATHS.VENDOR_MANAGER_PAYMENT_SETTINGS`
- Xoá cả file (toàn bộ `payments/`, 10 file): `VendorPaymentSettings.tsx`, `VendorPayoutChannelCard.tsx`, `BookingFinancialTimeline.tsx`, `PaymentReturn.tsx` (đã liệt kê ở mục A.3), `paymentService.ts`, `paymentState.ts` (+`.test.ts`), `banks.ts`, `types.ts`, `index.ts`

### 8. Danh sách thiết bị (Equipment)

- Route: `PATHS.VENDOR_MANAGER_EQUIPMENT`, `PATHS.PARTNER_EQUIPMENT`
- Xoá cả file (toàn bộ `vendor-equipment/`, 10 file): `EquipmentList.tsx`, `EquipmentTableRow.tsx`, `EquipmentFormDialog.tsx`, `DeleteEquipmentConfirmDialog.tsx`, `EquipmentPagination.tsx`, `useVendorEquipmentList.ts`, `useVendorEquipmentMutations.ts`, `useVendorEquipmentSummary.ts`, `vendorEquipmentService.ts`, `types.ts`

### 9. Danh sách Porter (tạo/sửa)

- Route: `.../PORTERS`, `.../PORTER_CREATE`, `.../PORTER_EDIT` (cả Manager & Staff)
- Xoá cả file (toàn bộ `vendor-porters/`, 13 file): `PorterList.tsx`, `PorterCreate.tsx`, `PorterEdit.tsx`, `PorterForm.tsx`, `PorterTableRow.tsx`, `PorterStatusBadge.tsx`, `DeletePorterConfirmDialog.tsx`, `PorterPagination.tsx`, `useVendorPorterList.ts`, `useVendorPorterMutations.ts`, `useVendorPorterSummary.ts`, `vendorPorterService.ts`, `types.ts`

### 10. Vận hành phiên tour (Sessions)

- Route: `.../SESSIONS`, `.../SESSION_DETAIL` (cả Manager & Staff)
- Xoá cả file (toàn bộ `vendor-sessions/`, 19 file — phụ thuộc trực tiếp vào `vendor-porters`/`vendor-equipment` nên không thể giữ độc lập): `SessionList.tsx`, `SessionDetail.tsx`, `SessionStatusBadge.tsx`, `SessionTableRow.tsx`, `SessionPagination.tsx`, `AssignPorterDialog.tsx`, `AssignEquipmentDialog.tsx`, `AssignCoordinatorDialog.tsx`, `PorterCard.tsx`, `CoordinatorCard.tsx`, `EquipmentAllocationTable.tsx`, `useVendorSessionList.ts`, `useVendorSessionMutations.ts`, `useVendorSessionAllocations.ts`, `usePorterCandidates.ts`, `useEquipmentCandidates.ts`, `useCoordinatorCandidates.ts`, `vendorSessionService.ts`, `types.ts`

### 11. Danh sách Voucher

- Route: `.../VOUCHERS` (cả Manager & Staff)
- Xoá cả file (toàn bộ `vendor-vouchers/`, 14 file): `VendorVoucherList.tsx`, `CreateVoucherDialog.tsx`, `EditVoucherDialog.tsx`, `ConfirmDeleteDialog.tsx`, `useVendorVouchers.ts`, `useVendorActiveVouchers.ts`, `useValidateVoucher.ts`, `useCreateVoucher.ts`, `useUpdateVoucher.ts`, `useDeleteVoucher.ts`, `vendorVoucherService.ts`, `types.ts`, `voucherSchema.ts`, `index.ts`

---

## C. Màn phía Admin (1 màn)

### 13. Duyệt hoàn tiền (Refund Reviews)

- Route: `PATHS.ADMIN_REFUNDS`
- Xoá cả file:
  - `src/features/admin/pages/RefundReviews.tsx`
  - `src/features/admin/services/adminRefundService.ts`

---

## D. Toàn bộ khu vực Coordinator (1 role-tree)

### 14. Coordinator (layout + 2 trang con)

- Route: subtree `PATHS.COORDINATOR` (dùng chung cho role Coordinator/Vendor Staff/Vendor Manager/Admin)
- Xoá cả file (toàn bộ `coordinator/`, 24 file, gồm cả `EmergencySosPanel.tsx` **phiên bản CŨ** — xem mục E): `CoordinatorLayout.tsx`, `CoordinatorSchedulesPage.tsx`, `CoordinatorSessionOperationsPage.tsx`, `AltitudeTrackerWidget.tsx`, `TrekkersPanel.tsx`, `CheckpointTimeline.tsx`, `OperationsHeaderBar.tsx`, `GearChecklistPanel.tsx`, `ReturnEquipmentModal.tsx`, `CoordinatorTrackingMap.tsx`, `EmergencySosPanel.tsx`, `OfflineSyncPanel.tsx`, `useSessionTrekkers.ts`, `useCoordinatorSchedules.ts`, `useOfflineTracking.ts`, `useSessionOperations.ts`, `useSessionOperationsMutations.ts`, `coordinatorScheduleService.ts` (+`.test.ts`), `offlineTrackingDb.ts`, `sessionOperationsService.ts`, `trackingService.ts`, `trackingMap.ts` (+`.test.ts`), `types/index.ts`

---

## E. Route cần gỡ khỏi `src/routes/AppRoutes.tsx`

| Route constant                                                           | Component                         | Role-tree                                                                                         |
| ------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `BOOK_TOUR`                                                              | `BookTour`                        | Protected (mọi user đăng nhập)                                                                    |
| `BOOKING_DETAIL` / `TREKKER_BOOKING_DETAIL`                              | `BookingDetail`                   | Protected / Trekker                                                                               |
| `BOOKING_PAYMENT` / `TREKKER_BOOKING_PAYMENT`                            | `PayBooking`                      | Protected / Trekker                                                                               |
| `PAYMENT_SUCCESS` / `PAYMENT_CANCEL`                                     | `PaymentReturn`                   | Protected                                                                                         |
| `MY_TOURS` / `TREKKER_MY_TOURS`                                          | `MyBookings`                      | Protected / Trekker                                                                               |
| `ADMIN_REFUNDS`                                                          | `RefundReviews`                   | Admin                                                                                             |
| `VENDOR_MANAGER_BOOKINGS` / `PARTNER_BOOKINGS`                           | `VendorBookingList`               | Vendor Manager / Staff                                                                            |
| `VENDOR_MANAGER_PAYMENT_SETTINGS`                                        | `VendorPaymentSettings`           | Vendor Manager                                                                                    |
| `VENDOR_MANAGER_EQUIPMENT` / `PARTNER_EQUIPMENT`                         | `EquipmentList`                   | Vendor Manager / Staff                                                                            |
| `VENDOR_MANAGER_PORTERS(+CREATE/EDIT)` / `PARTNER_PORTERS(+CREATE/EDIT)` | `PorterList/Create/Edit`          | Vendor Manager / Staff                                                                            |
| `VENDOR_MANAGER_SESSIONS(+DETAIL)` / `PARTNER_SESSIONS(+DETAIL)`         | `SessionList/Detail`              | Vendor Manager / Staff                                                                            |
| `VENDOR_MANAGER_VOUCHERS` / `PARTNER_VOUCHERS`                           | `VendorVoucherList`               | Vendor Manager / Staff                                                                            |
| `COORDINATOR` (cả subtree)                                               | `CoordinatorLayout` + 2 trang con | Coordinator/Staff/Manager/Admin                                                                   |
| `VENDOR_MANAGER_REPORTS`                                                 | `VendorReports`                   | Vendor Manager _(chờ quyết định mục B.12)_                                                        |
| `ADMIN_EMERGENCY` / `VENDOR_MANAGER_EMERGENCY`                           | `EmergencySosPage`                | Admin / Vendor Manager _(xoá cùng `emergency-sos/`, xem mục E — sẽ có route mới khi làm lại SOS)_ |

## G. Nav/sidebar cần gỡ item

- `src/shared/layout/AdminLayout.tsx` — gỡ "Duyệt hoàn tiền" (`ADMIN_REFUNDS`), "Duyệt Voucher" (`ADMIN_VOUCHERS`, đã disabled sẵn), **"Khẩn cấp (SOS)"** (`ADMIN_EMERGENCY` — xoá cùng `emergency-sos/`, xem mục E).
- `src/features/vendor-manager/layout/VendorManagerLayout.tsx` — gỡ "Đơn đặt tour", "Cấu hình thanh toán", "Voucher", "Thiết bị", "Porter", **"Khẩn cấp (SOS)"** (`VENDOR_MANAGER_EMERGENCY`). Cân nhắc gỡ "Báo cáo" (chờ quyết định B.12) và "Vận hành Tour" (nếu B.10 bị xoá).
- `src/features/vendor-staff/layout/VendorStaffLayout.tsx` — gỡ "Đơn Đặt Tour", "Voucher", "Thiết bị", "Porter". Cân nhắc "Vận hành Tour".
- `src/shared/layout/Sidebar.tsx` — không có gì liên quan, giữ nguyên.
