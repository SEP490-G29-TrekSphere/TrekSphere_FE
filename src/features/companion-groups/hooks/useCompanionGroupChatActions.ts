import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAddMemberToConversation } from '@/features/chat/hooks/useAddMemberToConversation';
import { useCheckConversation } from '@/features/chat/hooks/useCheckConversation';
import { useCreateConversation } from '@/features/chat/hooks/useCreateConversation';
import type { MatchingGroupDetailResponse } from '../types/matchingGroup';
import { companionGroupKeys } from './companionGroupKeys';

interface UseCompanionGroupChatActionsOptions {
  groupId?: string;
  group?: MatchingGroupDetailResponse;
  currentUserId?: string;
  chatPath: string;
  showFeedback: (msg: string) => void;
}

export function useCompanionGroupChatActions({
  groupId,
  group,
  currentUserId,
  chatPath,
  showFeedback,
}: UseCompanionGroupChatActionsOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const checkConversationMutation = useCheckConversation();
  const createConversationMutation = useCreateConversation();
  const addMemberMutation = useAddMemberToConversation();

  function openGroupChat() {
    if (!groupId || !group) return;
    const participantIds = group.members
      .filter(
        (member) => member.status === 'ACCEPTED' && String(member.userId) !== String(currentUserId)
      )
      .map((member) => member.userId);
    const request = {
      conversationType: 'GROUP' as const,
      title: group.groupName || 'Nhóm ghép',
      participantIds,
      matchingGroupId: groupId,
    };

    checkConversationMutation.mutate(request, {
      onSuccess: (conversation) => {
        if (conversation?.conversationId) {
          navigate(chatPath, { state: { conversationId: conversation.conversationId } });
          return;
        }
        createConversationMutation.mutate(request, {
          onSuccess: (createdConversation) => {
            void queryClient.invalidateQueries({ queryKey: companionGroupKeys.detail(groupId) });
            navigate(chatPath, { state: { conversationId: createdConversation.conversationId } });
          },
          onError: (error) =>
            showFeedback(error instanceof Error ? error.message : 'Lỗi khi tạo nhóm chat'),
        });
      },
      onError: (error) =>
        showFeedback(error instanceof Error ? error.message : 'Lỗi khi kiểm tra nhóm chat'),
    });
  }

  function openDirectChat(memberId: string, memberName: string, memberAvatar?: string) {
    if (!memberId) return;
    checkConversationMutation.mutate(
      { conversationType: 'DIRECT', participantIds: [memberId] },
      {
        onSuccess: (conversation) => {
          if (conversation?.conversationId) {
            navigate(chatPath, { state: { conversationId: conversation.conversationId } });
            return;
          }
          navigate(chatPath, {
            state: {
              virtualConversation: {
                type: 'DIRECT',
                participantIds: [memberId],
                userName: memberName,
                avatarUrl: memberAvatar,
              },
            },
          });
        },
        onError: (error) =>
          showFeedback(error instanceof Error ? error.message : 'Lỗi khi kiểm tra phòng chat'),
      }
    );
  }

  function confirmAddMemberToChat(
    selectedMember: { id: string; name: string } | null,
    onSuccessCallback: () => void
  ) {
    if (!selectedMember || !group?.hasConversation) return;
    checkConversationMutation.mutate(
      {
        conversationType: 'GROUP',
        title: group.groupName || 'Nhóm ghép',
        participantIds: [selectedMember.id],
        matchingGroupId: groupId,
      },
      {
        onSuccess: (conversation) => {
          if (!conversation?.conversationId) {
            showFeedback('Không tìm thấy nhóm chat tương ứng.');
            return;
          }
          addMemberMutation.mutate(
            { conversationId: conversation.conversationId, memberId: selectedMember.id },
            {
              onSuccess: () => {
                showFeedback(`Đã thêm ${selectedMember.name} vào nhóm chat!`);
                onSuccessCallback();
                if (groupId) {
                  void queryClient.invalidateQueries({
                    queryKey: companionGroupKeys.detail(groupId),
                  });
                }
              },
              onError: (error) =>
                showFeedback(
                  error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm thành viên.'
                ),
            }
          );
        },
        onError: () => showFeedback('Lỗi khi kiểm tra nhóm chat.'),
      }
    );
  }

  return {
    openGroupChat,
    openDirectChat,
    confirmAddMemberToChat,
    isAddBackPending: addMemberMutation.isPending || checkConversationMutation.isPending,
  };
}
