import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ApiStatus, VendorTourListItem } from '../types';
import { MANAGER_EDITABLE_STATUSES, TourTableRow } from './TourTableRow';

type RowOverrides = Partial<React.ComponentProps<typeof TourTableRow>>;

function renderRow(status: VendorTourListItem['status'], overrides: RowOverrides = {}) {
  const tour: VendorTourListItem = {
    id: 't1',
    name: 'Đỉnh Phượng Hoàng',
    basePrice: 15000000,
    difficulty: 'MODERATE',
    status,
    createdAt: '2026-07-20T10:00:00Z',
  };
  return render(
    <MemoryRouter>
      <table>
        <tbody>
          <TourTableRow
            tour={tour}
            editPath="/vendor/tours/t1/edit"
            previewPath="/vendor/tours/t1/preview"
            schedulesPath="/vendor/tours/t1/schedules"
            editableStatuses={MANAGER_EDITABLE_STATUSES}
            {...overrides}
          />
        </tbody>
      </table>
    </MemoryRouter>
  );
}

test('Xem trước: luôn hiện, không phụ thuộc trạng thái tour', () => {
  const statuses: ApiStatus[] = ['DRAFT', 'PUBLISHED', 'HIDDEN'];
  for (const status of statuses) {
    const { unmount } = renderRow(status);
    expect(screen.getByTitle('Xem trước')).toBeTruthy();
    unmount();
  }
});

test('Sửa: hiện ở mọi trạng thái (DRAFT/PUBLISHED/HIDDEN) — BE không giới hạn theo status', () => {
  const statuses: ApiStatus[] = ['DRAFT', 'PUBLISHED', 'HIDDEN'];
  for (const status of statuses) {
    const { unmount } = renderRow(status);
    expect(screen.getByTitle('Sửa tour')).toBeTruthy();
    unmount();
  }
});

test('Sửa: ẩn khi editableStatuses truyền vào rỗng', () => {
  renderRow('DRAFT', { editableStatuses: new Set<ApiStatus>() });
  expect(screen.queryByTitle('Sửa tour')).toBeNull();
});

test('Công khai tour: hiện khi có onPublishClick và status DRAFT', () => {
  renderRow('DRAFT', { onPublishClick: jest.fn() });
  expect(screen.getByTitle('Công khai tour')).toBeTruthy();
});

test('Công khai tour: ẩn khi không truyền handler', () => {
  renderRow('DRAFT');
  expect(screen.queryByTitle('Công khai tour')).toBeNull();
});

test('Công khai tour: ẩn khi status không phải DRAFT dù có handler', () => {
  renderRow('PUBLISHED', { onPublishClick: jest.fn() });
  expect(screen.queryByTitle('Công khai tour')).toBeNull();
});

test('Ngừng công khai: hiện khi có onUnpublishClick và status PUBLISHED', () => {
  renderRow('PUBLISHED', { onUnpublishClick: jest.fn() });
  expect(screen.getByTitle('Ngừng công khai')).toBeTruthy();
});

test('Ngừng công khai: ẩn khi status là DRAFT dù có handler', () => {
  renderRow('DRAFT', { onUnpublishClick: jest.fn() });
  expect(screen.queryByTitle('Ngừng công khai')).toBeNull();
});

test('Lịch khởi hành: bật khi tour DRAFT', () => {
  renderRow('DRAFT');
  expect(screen.getByTitle('Lịch khởi hành')).toHaveProperty('disabled', false);
});

test('Lịch khởi hành: bật khi tour PUBLISHED', () => {
  renderRow('PUBLISHED');
  expect(screen.getByTitle('Lịch khởi hành')).toHaveProperty('disabled', false);
});

test('Lịch khởi hành: disable kèm tooltip lý do khi tour HIDDEN', () => {
  renderRow('HIDDEN');
  const button = screen.getByTitle('Tour đang bị ẩn, không thể tạo lịch khởi hành');
  expect(button).toHaveProperty('disabled', true);
});

test('Xóa tour: hiện khi có onDeleteClick', () => {
  renderRow('DRAFT', { onDeleteClick: jest.fn() });
  expect(screen.getByTitle('Xóa tour')).toBeTruthy();
});

test('Xóa tour: ẩn khi không truyền onDeleteClick', () => {
  renderRow('DRAFT');
  expect(screen.queryByTitle('Xóa tour')).toBeNull();
});
