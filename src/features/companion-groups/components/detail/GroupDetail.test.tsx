import { fireEvent, render, screen } from '@testing-library/react';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';
import { GroupActionPanel } from './GroupActionPanel';
import { GroupBudgetTab } from './GroupBudgetTab';
import { GroupDetailErrorState } from './GroupDetailErrorState';
import { GroupDetailHero } from './GroupDetailHero';
import { GroupDetailSkeleton } from './GroupDetailSkeleton';
import { GroupDetailTabs } from './GroupDetailTabs';
import { GroupItineraryTab } from './GroupItineraryTab';
import { GroupModals } from './GroupModals';
import { GroupOverviewTab } from './GroupOverviewTab';
import { GroupRulesTab } from './GroupRulesTab';
import { JoinRequestsCard } from './JoinRequestsCard';
import { MembersCard } from './MembersCard';

const mockDetailGroup: MatchingGroupDetailResponse = {
  matchingGroupId: 'group-201',
  sourceType: 'CUSTOM_JOURNEY',
  tourId: null,
  tourName: null,
  tourImageUrl: 'https://example.com/fansipan.jpg',
  tourDescription: null,
  tourLocation: null,
  customJourneyId: 'cj-1',
  customJourneyTitle: 'Chinh Phục Fansipan',
  customJourneyDescription: 'Chuyến đi leo Fansipan 3N2D cùng nhóm bạn trẻ',
  customJourneyStartDate: '2026-11-20',
  customJourneyEndDate: '2026-11-22',
  groupName: 'Chinh Phục Fansipan',
  description: 'Chuyến đi leo Fansipan cuối tuần cùng nhóm bạn trẻ',
  difficulty: 'HARD',
  location: 'Lào Cai, Việt Nam',
  estimatedCost: 3500000,
  ownerId: 'u-1',
  ownerName: 'Trưởng Nhóm A',
  ownerAvatarUrl: '/avatar1.jpg',
  maxSize: 10,
  currentSize: 4,
  targetDate: '2026-11-20',
  matchingDeadline: '2026-11-15T00:00:00',
  status: 'OPEN',
  createdAt: '2026-09-01T00:00:00',
  isLocked: false,
  checkpoints: [
    {
      customJourneyCheckpointId: 'cp-1',
      dayNo: 1,
      checkpointOrder: 1,
      title: 'Trạm Tôn (Bắt đầu leo)',
      description: 'Tập trung tại Trạm Tôn lúc 7h sáng, chuẩn bị đồ đạc',
      locationName: 'Trạm Tôn, Vườn Quốc Gia Hoàng Liên',
      latitude: 22.35,
      longitude: 103.78,
      plannedStartAt: '07:00',
      plannedEndAt: '12:00',
      imageUrl: null,
    },
    {
      customJourneyCheckpointId: 'cp-2',
      dayNo: 1,
      checkpointOrder: 2,
      title: 'Lán nghỉ 2800m',
      description: 'Nghỉ ngơi ăn tối và cắm trại qua đêm',
      locationName: 'Lán 2800m',
      latitude: 22.33,
      longitude: 103.77,
      plannedStartAt: '16:00',
      plannedEndAt: '20:00',
      imageUrl: null,
    },
  ],
  costItems: [
    {
      customJourneyCostItemId: 'cost-1',
      itemName: 'Vé vào cổng & Giấy phép leo núi',
      category: 'PERMIT',
      estimatedAmount: 300000,
      note: 'Phí Vườn Quốc Gia Hoàng Liên',
    },
    {
      customJourneyCostItemId: 'cost-2',
      itemName: 'Porter & Hướng dẫn viên bản địa',
      category: 'GUIDE',
      estimatedAmount: 1200000,
      note: '2 Porter hỗ trợ cả đoàn',
    },
    {
      customJourneyCostItemId: 'cost-3',
      itemName: 'Ăn uống 3 ngày 2 đêm',
      category: 'FOOD',
      estimatedAmount: 800000,
      note: 'Thực phẩm tươi và nước uống',
    },
  ],
  members: [
    {
      matchingMemberId: 'mm-1',
      applicationId: null,
      userId: 'u-1',
      fullName: 'Trưởng Nhóm A',
      avatarUrl: '/avatar1.jpg',
      joinedAt: '2026-09-01T00:00:00',
      leftAt: null,
      role: 'LEADER',
      status: 'ACCEPTED',
      message: null,
      rejectReason: null,
      createdAt: '2026-09-01T00:00:00',
      reviewedAt: null,
      withdrawnAt: null,
      isInConversation: true,
    },
    {
      matchingMemberId: 'mm-2',
      applicationId: null,
      userId: 'u-2',
      fullName: 'Thành Viên B',
      avatarUrl: null,
      joinedAt: '2026-09-02T00:00:00',
      leftAt: null,
      role: 'MEMBER',
      status: 'ACCEPTED',
      message: null,
      rejectReason: null,
      createdAt: '2026-09-02T00:00:00',
      reviewedAt: null,
      withdrawnAt: null,
      isInConversation: true,
    },
  ],
  isOwner: false,
  myMembershipStatus: null,
  canJoin: true,
  canLeave: false,
  hasConversation: true,
  isInConversation: false,
};

describe('Matching Group Detail & Permission Components (MGFE-S3)', () => {
  describe('GroupDetailHero', () => {
    it('renders hero information, group name, location, and member stats', () => {
      render(
        <GroupDetailHero
          groupName="Chinh Phục Fansipan"
          tourName="Fansipan 3N2D"
          tourImageUrl="https://example.com/fansipan.jpg"
          location="Lào Cai, Việt Nam"
          description="Chuyến đi leo Fansipan cuối tuần cùng nhóm bạn trẻ"
          status="OPEN"
          targetDate="2026-11-20"
          matchingDeadline="2026-11-15T00:00:00"
          difficulty="HARD"
          estimatedCost={3500000}
          currentMembers={4}
          maxMembers={10}
        />
      );

      expect(screen.getByText('Chinh Phục Fansipan')).toBeTruthy();
      expect(screen.getByText(/Fansipan 3N2D/i)).toBeTruthy();
      expect(screen.getByText('Lào Cai, Việt Nam')).toBeTruthy();
      expect(screen.getByText(/10 thành viên/i)).toBeTruthy();
      expect(screen.getByText('Đang tuyển')).toBeTruthy();
      expect(screen.getByText('Thử thách')).toBeTruthy();
      expect(screen.getByText(/3.500.000 đ/i)).toBeTruthy();
    });
  });

  describe('GroupDetailTabs', () => {
    it('renders 4 tab options and triggers onTabChange callback', () => {
      const handleTabChange = jest.fn();
      render(
        <GroupDetailTabs
          activeTab="overview"
          onTabChange={handleTabChange}
          checkpointCount={2}
          costItemCount={3}
        />
      );

      expect(screen.getByText('Tổng quan & Thành viên')).toBeTruthy();
      expect(screen.getByText('Lộ trình & Điểm dừng')).toBeTruthy();
      expect(screen.getByText('Dự toán chi phí')).toBeTruthy();
      expect(screen.getByText('Cam kết & An toàn')).toBeTruthy();

      const itineraryTab = screen.getByRole('button', { name: /lộ trình & điểm dừng/i });
      fireEvent.click(itineraryTab);
      expect(handleTabChange).toHaveBeenCalledWith('itinerary');
    });
  });

  describe('GroupOverviewTab', () => {
    it('renders leader profile card with verification badge and bio', () => {
      const handleDirectChat = jest.fn();
      const overviewProps = {
        group: mockDetailGroup,
        currentUserId: 'u-9',
        role: 'guest' as const,
        onDirectChat: handleDirectChat,
        onAddMemberToChat: jest.fn(),
      };
      render(<GroupOverviewTab {...overviewProps} />);

      expect(screen.getAllByText('Trưởng Nhóm A').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Đã xác minh')).toBeTruthy();
      expect(screen.getByText('Trưởng nhóm khởi xướng (Group Leader)')).toBeTruthy();

      const chatLeaderBtn = screen.getByRole('button', { name: /nhắn tin leader/i });
      fireEvent.click(chatLeaderBtn);
      expect(handleDirectChat).toHaveBeenCalledWith('u-1', 'Trưởng Nhóm A', '/avatar1.jpg');
    });
  });

  describe('GroupItineraryTab', () => {
    it('renders checkpoints timeline with day badges and locations', () => {
      render(<GroupItineraryTab group={mockDetailGroup} />);

      expect(screen.getByText('Lộ trình chuyến đi')).toBeTruthy();
      expect(screen.getByText('Trạm Tôn (Bắt đầu leo)')).toBeTruthy();
      expect(screen.getByText('Lán nghỉ 2800m')).toBeTruthy();
      expect(screen.getByText('Trạm Tôn, Vườn Quốc Gia Hoàng Liên')).toBeTruthy();
      expect(screen.getByText('07:00 - 12:00')).toBeTruthy();
    });
  });

  describe('GroupBudgetTab', () => {
    it('renders itemized cost items with categories and formatted amounts', () => {
      render(<GroupBudgetTab group={mockDetailGroup} />);

      expect(screen.getByText('Dự toán chi phí hành trình')).toBeTruthy();
      expect(screen.getByText('Vé vào cổng & Giấy phép leo núi')).toBeTruthy();
      expect(screen.getByText('Porter & Hướng dẫn viên bản địa')).toBeTruthy();
      expect(screen.getByText('Ăn uống 3 ngày 2 đêm')).toBeTruthy();
      expect(screen.getByText('300.000 đ')).toBeTruthy();
      expect(screen.getByText('1.200.000 đ')).toBeTruthy();
      expect(screen.getByText('800.000 đ')).toBeTruthy();
    });
  });

  describe('GroupRulesTab', () => {
    it('renders safety, leave no trace, and withdrawal rules', () => {
      render(<GroupRulesTab group={mockDetailGroup} />);

      expect(screen.getByText('Cam kết & Quy tắc chuyến đi')).toBeTruthy();
      expect(screen.getByText('An toàn & Thể lực')).toBeTruthy();
      expect(screen.getByText('Leave No Trace')).toBeTruthy();
      expect(screen.getByText('Tinh thần đồng đội')).toBeTruthy();
      expect(screen.getByText('Chính sách rút đơn')).toBeTruthy();
    });
  });

  describe('GroupActionPanel Permission States', () => {
    const defaultProps = {
      groupStatus: 'OPEN' as const,
      isJoining: false,
      onOpenChat: jest.fn(),
      onJoin: jest.fn(),
      onLeave: jest.fn(),
      onCancelRequest: jest.fn(),
      onCreateGroupChat: jest.fn(),
      acceptedMembersCount: 4,
      hasConversation: true,
      isInConversation: true,
    };

    it('renders guest state with application message form and handles submit', () => {
      const handleJoin = jest.fn();
      const guestProps = { ...defaultProps, role: 'guest' as const };
      render(<GroupActionPanel {...guestProps} onJoin={handleJoin} />);

      expect(screen.getByText('Gửi Đơn Tham Gia Nhóm')).toBeTruthy();
      const textarea = screen.getByPlaceholderText(/mình đã từng leo/i);
      fireEvent.change(textarea, { target: { value: 'Mình có kinh nghiệm leo núi 2 năm' } });

      const joinBtn = screen.getByRole('button', { name: /gửi đơn tham gia/i });
      expect(joinBtn).toBeTruthy();
      fireEvent.click(joinBtn);
      expect(handleJoin).toHaveBeenCalledWith('Mình có kinh nghiệm leo núi 2 năm');
    });

    it('renders pending applicant state with withdraw request button', () => {
      const handleCancel = jest.fn();
      const pendingProps = { ...defaultProps, role: 'pending' as const };
      render(<GroupActionPanel {...pendingProps} onCancelRequest={handleCancel} />);

      expect(screen.getByText('Yêu cầu đang chờ duyệt')).toBeTruthy();
      const cancelBtn = screen.getByRole('button', { name: /hủy yêu cầu tham gia/i });
      expect(cancelBtn).toBeTruthy();
      fireEvent.click(cancelBtn);
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it('renders accepted member state with leave group button', () => {
      const handleLeave = jest.fn();
      const memberProps = { ...defaultProps, role: 'member' as const };
      render(<GroupActionPanel {...memberProps} onLeave={handleLeave} />);

      expect(screen.getByText('Bạn đã là thành viên')).toBeTruthy();
      const leaveBtn = screen.getByRole('button', { name: /rời khỏi nhóm ghép/i });
      expect(leaveBtn).toBeTruthy();
      fireEvent.click(leaveBtn);
      expect(handleLeave).toHaveBeenCalledTimes(1);
    });

    it('renders leader chat controls', () => {
      const handleCreateChat = jest.fn();
      const leaderProps = { ...defaultProps, role: 'leader' as const };
      render(<GroupActionPanel {...leaderProps} onCreateGroupChat={handleCreateChat} />);

      const chatBtn = screen.getByRole('button', { name: /vào nhóm chat/i });
      expect(chatBtn).toBeTruthy();
      fireEvent.click(chatBtn);
      expect(handleCreateChat).toHaveBeenCalledTimes(1);
    });
  });

  describe('MembersCard', () => {
    const mockMembers = mockDetailGroup.members;

    it('renders member list with badges and direct chat button for members', () => {
      const handleDirectChat = jest.fn();
      const memberCardProps = {
        members: mockMembers,
        maxSize: 10,
        ownerName: 'Trưởng Nhóm A',
        currentUserId: 'u-1',
        role: 'leader' as const,
        hasConversation: true,
        onDirectChat: handleDirectChat,
        onAddMemberToChat: jest.fn(),
      };
      render(<MembersCard {...memberCardProps} />);

      expect(screen.getByText('Thành viên nhóm')).toBeTruthy();
      expect(screen.getByText('2/10 người đồng hành đã tham gia')).toBeTruthy();
      expect(screen.getByText('Trưởng Nhóm A')).toBeTruthy();
      expect(screen.getByText('Thành Viên B')).toBeTruthy();
    });
  });

  describe('JoinRequestsCard for Leader', () => {
    const mockRequests = [
      {
        matchingMemberId: null,
        applicationId: 'app-1',
        userId: 'u-3',
        fullName: 'Ứng Viên C',
        avatarUrl: null,
        message: 'Mình muốn tham gia cùng nhóm!',
        status: 'PENDING' as const,
        role: 'MEMBER' as const,
        rejectReason: null,
        createdAt: '2026-09-03T10:00:00',
        reviewedAt: null,
        withdrawnAt: null,
        joinedAt: null,
        leftAt: null,
        isInConversation: null,
      },
    ];

    it('renders incoming join requests with approve and reject actions', () => {
      const handleApprove = jest.fn();
      const handleReject = jest.fn();

      render(
        <JoinRequestsCard
          requests={mockRequests}
          isLoading={false}
          isError={false}
          onRetry={jest.fn()}
          onApprove={handleApprove}
          onReject={handleReject}
          page={1}
          totalPages={1}
          totalElements={1}
          isLast={true}
          onPrevPage={jest.fn()}
          onNextPage={jest.fn()}
        />
      );

      expect(screen.getByText('Duyệt thành viên xin vào nhóm')).toBeTruthy();
      expect(screen.getByText('1 yêu cầu chờ xử lý')).toBeTruthy();
      expect(screen.getByText('Ứng Viên C')).toBeTruthy();
      expect(screen.getByText(/Mình muốn tham gia cùng nhóm!/i)).toBeTruthy();

      const approveBtn = screen.getByRole('button', { name: /duyệt/i });
      fireEvent.click(approveBtn);
      expect(handleApprove).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'app-1', userName: 'Ứng Viên C' })
      );

      const rejectBtn = screen.getByRole('button', { name: /từ chối/i });
      fireEvent.click(rejectBtn);
      expect(handleReject).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'app-1', userName: 'Ứng Viên C' })
      );
    });
  });

  describe('GroupModals', () => {
    it('renders approve confirmation modal when activeModal is approve', () => {
      const handleConfirm = jest.fn();
      const handleClose = jest.fn();

      render(
        <GroupModals
          activeModal="approve"
          setActiveModal={handleClose}
          selectedRequest={{
            id: 'req-1',
            userName: 'Nguyễn Văn A',
          }}
          selectedAddBackMember={null}
          currentUserRole="leader"
          isApprovePending={false}
          isRejectPending={false}
          isLeaveModalPending={false}
          isAddBackPending={false}
          onConfirmApprove={handleConfirm}
          onConfirmReject={jest.fn()}
          onConfirmLeaveGroup={jest.fn()}
          onConfirmCancelJoinRequest={jest.fn()}
          onConfirmAddBackToChat={jest.fn()}
        />
      );

      expect(screen.getByText('Duyệt thành viên gia nhập')).toBeTruthy();
      expect(screen.getByText(/Bạn có chắc chắn muốn duyệt/i)).toBeTruthy();

      const confirmBtn = screen.getByRole('button', { name: /xác nhận duyệt/i });
      fireEvent.click(confirmBtn);
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Skeleton and Error States', () => {
    it('renders loading skeleton', () => {
      const { container } = render(<GroupDetailSkeleton />);
      expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('renders error state with retry and back buttons', () => {
      const handleRetry = jest.fn();
      const handleBack = jest.fn();

      render(
        <GroupDetailErrorState
          message="Không tìm thấy nhóm ghép"
          onRetry={handleRetry}
          onBack={handleBack}
        />
      );

      expect(screen.getByText('Không tìm thấy nhóm ghép')).toBeTruthy();
      const retryBtn = screen.getByRole('button', { name: /thử lại/i });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);

      const backBtn = screen.getByRole('button', { name: /quay lại/i });
      fireEvent.click(backBtn);
      expect(handleBack).toHaveBeenCalledTimes(1);
    });
  });
});
