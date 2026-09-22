import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import PortalShell from './PortalShell';

function renderShell() {
  const view = render(
    <MemoryRouter initialEntries={['/admin/accounts']}>
      <PortalShell
        brand={<span>TrekSphere</span>}
        nav={<Link to="/admin/vendors">Nhà cung cấp</Link>}
        userCard={<span>Admin User</span>}
        mobileTitle="TrekSphere Admin"
      >
        <Routes>
          <Route path="/admin/accounts" element={<p>Trang tài khoản</p>} />
          <Route path="/admin/vendors" element={<p>Trang nhà cung cấp</p>} />
        </Routes>
      </PortalShell>
    </MemoryRouter>
  );
  const aside = view.container.querySelector('aside');
  if (!aside) throw new Error('PortalShell phải render <aside>');
  return { ...view, aside };
}

const isOpen = (aside: Element) => !aside.className.split(/\s+/).includes('-translate-x-full');
const openMenu = () => fireEvent.click(screen.getByLabelText('Mở menu điều hướng'));

test('mặc định drawer đóng (trượt khỏi màn hình)', () => {
  const { aside } = renderShell();
  expect(isOpen(aside)).toBe(false);
});

test('bấm hamburger thì mở drawer', () => {
  const { aside } = renderShell();
  openMenu();
  expect(isOpen(aside)).toBe(true);
});

test('điều hướng sang trang khác thì drawer tự đóng', () => {
  const { aside } = renderShell();
  openMenu();
  fireEvent.click(screen.getByText('Nhà cung cấp'));
  expect(screen.getByText('Trang nhà cung cấp')).toBeDefined();
  expect(isOpen(aside)).toBe(false);
});

test('nhấn Escape thì đóng drawer', () => {
  const { aside } = renderShell();
  openMenu();
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(isOpen(aside)).toBe(false);
});

test('bấm lớp phủ thì đóng drawer', () => {
  const { aside } = renderShell();
  openMenu();

  fireEvent.click(screen.getAllByLabelText('Đóng menu điều hướng')[0]);
  expect(isOpen(aside)).toBe(false);
});

test('khoá scroll nền khi drawer mở và trả lại khi đóng', () => {
  renderShell();
  openMenu();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(document.body.style.overflow).not.toBe('hidden');
});

test('bấm toggle desktop thì thu gọn và mở rộng sidebar', () => {
  const { aside } = renderShell();
  const toggleBtn = screen.getByLabelText('Thu gọn sidebar');
  expect(aside.className).toContain('md:w-72');

  fireEvent.click(toggleBtn);
  expect(aside.className).toContain('md:w-20');
  expect(screen.getByLabelText('Mở rộng sidebar')).toBeDefined();

  fireEvent.click(screen.getByLabelText('Mở rộng sidebar'));
  expect(aside.className).toContain('md:w-72');
});
