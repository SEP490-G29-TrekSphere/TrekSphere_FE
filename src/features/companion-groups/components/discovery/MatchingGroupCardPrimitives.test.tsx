import { render, screen } from '@testing-library/react';
import { MatchingGroupOwnerAvatar, MatchingGroupStatusBadge } from './MatchingGroupCardPrimitives';

describe('MatchingGroupStatusBadge', () => {
  test('render đúng nhãn status từ typed metadata', () => {
    render(<MatchingGroupStatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('Đang diễn ra')).toBeTruthy();
  });
});

describe('MatchingGroupOwnerAvatar', () => {
  test('render initials khi không có avatar URL', () => {
    render(<MatchingGroupOwnerAvatar name="Nguyễn Văn An" />);
    expect(screen.getByText('NV')).toBeTruthy();
  });

  test('render ảnh với accessible name khi có avatar URL', () => {
    render(<MatchingGroupOwnerAvatar name="Nguyễn An" avatarUrl="/avatar.jpg" />);
    expect(screen.getByRole('img', { name: 'Nguyễn An' }).getAttribute('src')).toBe('/avatar.jpg');
  });
});
