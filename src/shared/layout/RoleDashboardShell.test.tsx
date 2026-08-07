import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import RoleDashboardShell from './RoleDashboardShell';

/**
 * Drawer mobile là phần logic duy nhất `RoleDashboardShell` tự quản (phần còn
 * lại chỉ là class Tailwind). Test bám vào 3 hành vi khiến nó hỏng là người
 * dùng mất điều hướng: mở được, tự đóng sau khi điều hướng, đóng bằng Escape.
 */
function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/admin/accounts']}>
      <RoleDashboardShell
        mobileTitle="TrekSphere"
        sidebar={<Link to="/admin/vendors">Nhà cung cấp</Link>}
      >
        <Routes>
          <Route path="/admin/accounts" element={<p>Trang tài khoản</p>} />
          <Route path="/admin/vendors" element={<p>Trang nhà cung cấp</p>} />
        </Routes>
      </RoleDashboardShell>
    </MemoryRouter>
  );
}

const openMenu = () => fireEvent.click(screen.getByLabelText('Mở menu điều hướng'));
const drawer = () => screen.queryByRole('dialog', { name: 'Menu điều hướng' });

test('mặc định chưa mở drawer, sidebar chỉ render 1 lần (cột desktop)', () => {
  renderShell();
  expect(drawer()).toBeNull();
  expect(screen.getAllByText('Nhà cung cấp')).toHaveLength(1);
});

test('bấm nút hamburger thì mở drawer điều hướng', () => {
  renderShell();
  openMenu();
  expect(drawer()).not.toBeNull();
  // Sidebar xuất hiện ở cả cột desktop lẫn trong drawer.
  expect(screen.getAllByText('Nhà cung cấp')).toHaveLength(2);
});

test('điều hướng sang trang khác thì drawer tự đóng', () => {
  renderShell();
  openMenu();
  // Link bên trong drawer (bản thứ 2) — đúng thứ user bấm trên mobile.
  fireEvent.click(screen.getAllByText('Nhà cung cấp')[1]);
  expect(screen.getByText('Trang nhà cung cấp')).toBeDefined();
  expect(drawer()).toBeNull();
});

test('nhấn Escape thì đóng drawer', () => {
  renderShell();
  openMenu();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(drawer()).toBeNull();
});

test('bấm nền mờ thì đóng drawer', () => {
  renderShell();
  openMenu();
  fireEvent.click(screen.getAllByLabelText('Đóng menu')[0]);
  expect(drawer()).toBeNull();
});
