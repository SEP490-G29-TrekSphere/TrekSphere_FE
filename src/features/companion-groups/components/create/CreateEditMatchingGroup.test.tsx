import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import { CreateMatchingGroupForm } from './CreateMatchingGroupForm';
import { EditMatchingGroupModal } from './EditMatchingGroupModal';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockCreateMutateAsync = jest.fn();
jest.mock('../../hooks/useCreateMatchingGroup', () => ({
  useCreateMatchingGroup: () => ({
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  }),
}));

const mockUpdateMutateAsync = jest.fn();
jest.mock('../../hooks/useUpdateMatchingGroup', () => ({
  useUpdateMatchingGroup: () => ({
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  }),
}));

const VALID_TOUR_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

jest.mock('@/features/tours/hooks/useTours', () => ({
  useTours: () => ({
    tours: [
      { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Tà Năng Phan Dũng 3N2D' },
      { id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', name: 'Chinh Phục Fansipan' },
    ],
    isLoading: false,
  }),
}));

const mockDetailGroup: MatchingGroupDetailResponse = {
  matchingGroupId: 'group-101',
  sourceType: 'TOUR',
  tourId: VALID_TOUR_ID,
  tourName: 'Tà Năng Phan Dũng 3N2D',
  tourImageUrl: null,
  tourDescription: null,
  tourLocation: null,
  customJourneyId: null,
  customJourneyTitle: null,
  customJourneyDescription: null,
  customJourneyStartDate: null,
  customJourneyEndDate: null,
  groupName: 'Nhóm Leo Núi Tà Năng',
  description: 'Cần tìm 4 bạn đồng hành cùng leo núi',
  difficulty: 'MODERATE',
  location: 'Lâm Đồng',
  estimatedCost: 2500000,
  ownerId: 'u-1',
  ownerName: 'Trưởng Nhóm A',
  ownerAvatarUrl: null,
  maxSize: 8,
  currentSize: 4,
  targetDate: '2026-11-20',
  matchingDeadline: '2026-11-15T00:00:00',
  status: 'OPEN',
  createdAt: '2026-09-01T00:00:00',
  isLocked: false,
  checkpoints: [],
  costItems: [],
  members: [],
  isOwner: true,
  myMembershipStatus: null,
  canJoin: false,
  canLeave: false,
  hasConversation: true,
  isInConversation: true,
};

describe('Create & Edit Matching Group Components (MGFE-S4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CreateMatchingGroupForm', () => {
    it('renders form fields including tour select, group name, max size, dates, and description', () => {
      render(
        <MemoryRouter>
          <CreateMatchingGroupForm onCancel={jest.fn()} />
        </MemoryRouter>
      );

      expect(screen.getByText('Chọn tour')).toBeTruthy();
      expect(screen.getByText('Tên nhóm')).toBeTruthy();
      expect(screen.getByText('Tà Năng Phan Dũng 3N2D')).toBeTruthy();
      expect(screen.getByText('Chinh Phục Fansipan')).toBeTruthy();
      expect(screen.getByPlaceholderText('Ví dụ: Nhóm Fansipan tháng 8')).toBeTruthy();
    });

    it('submits valid form data and triggers create mutation', async () => {
      mockCreateMutateAsync.mockResolvedValueOnce({ matchingGroupId: 'new-group-102' });
      const handleCancel = jest.fn();

      const { container } = render(
        <MemoryRouter>
          <CreateMatchingGroupForm onCancel={handleCancel} />
        </MemoryRouter>
      );

      // Select tour
      const tourSelect = container.querySelector('select[name="tourId"]') as HTMLSelectElement;
      fireEvent.change(tourSelect, { target: { value: VALID_TOUR_ID } });

      // Type group name
      const nameInput = screen.getByPlaceholderText('Ví dụ: Nhóm Fansipan tháng 8');
      fireEvent.change(nameInput, { target: { value: 'Nhóm Leo Tà Năng Cuối Tuần' } });

      // Pick target date and matching deadline
      const targetDateInput = screen.getByPlaceholderText('Chọn ngày');
      fireEvent.change(targetDateInput, { target: { value: '20/11/2026' } });

      const deadlineInput = screen.getByPlaceholderText('Chọn hạn');
      fireEvent.change(deadlineInput, { target: { value: '15/11/2026 10:00' } });

      // Click submit
      const submitBtn = screen.getByRole('button', { name: /tạo nhóm/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalled();
      });
    });

    it('triggers onCancel when Cancel button is clicked', () => {
      const handleCancel = jest.fn();
      render(
        <MemoryRouter>
          <CreateMatchingGroupForm onCancel={handleCancel} />
        </MemoryRouter>
      );

      const cancelBtn = screen.getByRole('button', { name: /hủy bỏ/i });
      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('EditMatchingGroupModal', () => {
    it('pre-fills existing group information and submits update mutation', async () => {
      mockUpdateMutateAsync.mockResolvedValueOnce({});
      const handleClose = jest.fn();

      render(
        <EditMatchingGroupModal isOpen={true} onClose={handleClose} group={mockDetailGroup} />
      );

      expect(screen.getByText('Chỉnh sửa thông tin nhóm')).toBeTruthy();
      const nameInput = screen.getByLabelText(/tên nhóm/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Nhóm Leo Núi Tà Năng');

      // Edit group name
      fireEvent.change(nameInput, { target: { value: 'Nhóm Leo Núi Tà Năng (Đã đổi)' } });

      // Submit
      const saveBtn = screen.getByRole('button', { name: /lưu thay đổi/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            groupId: 'group-101',
            payload: expect.objectContaining({
              groupName: 'Nhóm Leo Núi Tà Năng (Đã đổi)',
            }),
          })
        );
      });
    });

    it('does not render when isOpen is false', () => {
      const { container } = render(
        <EditMatchingGroupModal isOpen={false} onClose={jest.fn()} group={mockDetailGroup} />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
