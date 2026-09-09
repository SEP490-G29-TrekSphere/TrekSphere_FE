import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { MatchingGroupItem } from '../../types/matchingGroup';
import { MatchingGroupDiscoveryFilters } from './MatchingGroupDiscoveryFilters';
import { MatchingGroupDiscoveryResults } from './MatchingGroupDiscoveryResults';
import { MatchingGroupDiscoverySearchBar } from './MatchingGroupDiscoverySearchBar';

const mockGroup: MatchingGroupItem = {
  matchingGroupId: 'group-101',
  sourceType: 'TOUR',
  tourId: 'tour-1',
  tourName: 'Tà Năng Phan Dũng',
  customJourneyId: null,
  customJourneyTitle: null,
  difficulty: 'HARD',
  location: 'Lâm Đồng',
  estimatedCost: 2500000,
  ownerId: 'user-1',
  ownerName: 'Nguyễn Văn A',
  ownerAvatarUrl: null,
  tourImageUrl: 'https://example.com/tanang.jpg',
  groupName: 'Leo Tà Năng Cuối Tuần',
  description: 'Nhóm leo núi trải nghiệm cung Tà Năng Phan Dũng',
  maxSize: 8,
  currentSize: 4,
  targetDate: '2026-10-15',
  matchingDeadline: '2026-10-10T00:00:00',
  status: 'OPEN',
  createdAt: '2026-09-01T10:00:00',
};

const mockTours = [
  { id: 'tour-1', name: 'Tà Năng Phan Dũng' },
  { id: 'tour-2', name: 'Fansipan 2N1D' },
];

describe('Matching Group Public Discovery Components', () => {
  describe('MatchingGroupDiscoverySearchBar', () => {
    it('renders search input and calls onSearchChange on typing', () => {
      const handleSearch = jest.fn();
      render(
        <MatchingGroupDiscoverySearchBar searchQuery="Tà Năng" onSearchChange={handleSearch} />
      );

      const input = screen.getByPlaceholderText('Tìm theo tên nhóm, tour...') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.value).toBe('Tà Năng');

      fireEvent.change(input, { target: { value: 'Fansipan' } });
      expect(handleSearch).toHaveBeenCalledWith('Fansipan');
    });
  });

  describe('MatchingGroupDiscoveryFilters', () => {
    it('renders tour dropdown, datepicker, status options, and triggers change callbacks', () => {
      const handleTourChange = jest.fn();
      const handleDateChange = jest.fn();
      const handleStatusChange = jest.fn();
      const handleSlotsChange = jest.fn();
      const handleReset = jest.fn();

      render(
        <MatchingGroupDiscoveryFilters
          tours={mockTours}
          selectedTourId=""
          selectedDate=""
          statusFilter="ALL"
          availableSlotsOnly={false}
          onTourChange={handleTourChange}
          onDateChange={handleDateChange}
          onStatusChange={handleStatusChange}
          onAvailableSlotsChange={handleSlotsChange}
          onReset={handleReset}
        />
      );

      expect(screen.getByText('Bộ lọc')).toBeTruthy();
      expect(screen.getByText('Tà Năng Phan Dũng')).toBeTruthy();

      // Change tour
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'tour-2' } });
      expect(handleTourChange).toHaveBeenCalledWith('tour-2');

      // Click status
      const openStatusBtn = screen.getByRole('button', { name: /đang mở/i });
      fireEvent.click(openStatusBtn);
      expect(handleStatusChange).toHaveBeenCalledWith('OPEN');

      // Click available slots checkbox
      const slotsCheckbox = screen.getByRole('checkbox');
      fireEvent.click(slotsCheckbox);
      expect(handleSlotsChange).toHaveBeenCalledWith(true);

      // Click reset
      const resetBtn = screen.getByRole('button', { name: /làm mới bộ lọc/i });
      fireEvent.click(resetBtn);
      expect(handleReset).toHaveBeenCalled();
    });
  });

  describe('MatchingGroupDiscoveryResults', () => {
    const defaultProps = {
      groups: [mockGroup],
      matchingGroupCount: 1,
      totalElements: 1,
      pageNumber: 0,
      totalPages: 1,
      layout: 'grid' as const,
      sortKey: 'createdAt-desc',
      statusFilter: 'ALL' as const,
      isLoading: false,
      isError: false,
      isGuest: true,
      joinedGroupIds: new Set<string>(),
      onLayoutChange: jest.fn(),
      onSortChange: jest.fn(),
      onPageChange: jest.fn(),
      onRetry: jest.fn(),
      onReset: jest.fn(),
      onLogin: jest.fn(),
      onJoinGroup: jest.fn(),
      onViewDetail: jest.fn(),
    };

    it('renders matching groups list with card in grid layout', () => {
      render(
        <MemoryRouter>
          <MatchingGroupDiscoveryResults {...defaultProps} />
        </MemoryRouter>
      );

      expect(screen.getByText('Nhóm ghép')).toBeTruthy();
      expect(screen.getByText('Leo Tà Năng Cuối Tuần')).toBeTruthy();
      expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
    });

    it('renders empty state when groups array is empty', () => {
      render(
        <MemoryRouter>
          <MatchingGroupDiscoveryResults {...defaultProps} groups={[]} totalElements={0} />
        </MemoryRouter>
      );

      expect(screen.getByText('Không tìm thấy nhóm phù hợp')).toBeTruthy();
      expect(screen.getByText('Làm mới bộ lọc')).toBeTruthy();
    });

    it('renders error state when isError is true', () => {
      const handleRetry = jest.fn();
      render(
        <MemoryRouter>
          <MatchingGroupDiscoveryResults {...defaultProps} isError={true} onRetry={handleRetry} />
        </MemoryRouter>
      );

      expect(screen.getByText('Không thể tải danh sách nhóm')).toBeTruthy();
      const retryBtn = screen.getByRole('button', { name: /thử lại/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalled();
    });

    it('allows switching layout between grid and list', () => {
      const handleLayoutChange = jest.fn();
      render(
        <MemoryRouter>
          <MatchingGroupDiscoveryResults {...defaultProps} onLayoutChange={handleLayoutChange} />
        </MemoryRouter>
      );

      const listBtn = screen.getByRole('button', { name: /hiển thị danh sách/i });
      fireEvent.click(listBtn);
      expect(handleLayoutChange).toHaveBeenCalledWith('list');
    });
  });
});
