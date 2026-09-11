import { AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGroupDetailPath, PATHS } from '@/constants/paths';
import { AppButton } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';
import { JoinGroupApplicationPanel } from '../components/applications/JoinGroupApplicationPanel';
import { JoinGroupSummary } from '../components/applications/JoinGroupSummary';
import { useJoinMatchingGroup } from '../hooks/useJoinMatchingGroup';
import { useMatchingGroupDetail } from '../hooks/useMatchingGroupDetail';
import type { JoinGroupApplicationFormValues } from '../validations';

interface JoinGroupRequestPageProps {
  embedded?: boolean;
  backPath?: string;
  getDetailPath?: (groupId: string) => string;
}

export default function JoinGroupRequestPage({
  embedded = false,
  backPath = PATHS.GROUPS,
  getDetailPath = getGroupDetailPath,
}: JoinGroupRequestPageProps = {}) {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const detailPath = groupId ? getDetailPath(groupId) : backPath;
  const { data: group, isLoading, isError } = useMatchingGroupDetail(groupId);
  const joinMutation = useJoinMatchingGroup();
  const user = useAppStore((state) => state.user);
  const isOwner = Boolean(user && group && String(group.ownerId) === String(user.id));

  useEffect(() => {
    if (isOwner) navigate(detailPath, { replace: true });
  }, [detailPath, isOwner, navigate]);

  function submitApplication(values: JoinGroupApplicationFormValues) {
    if (!groupId) return;
    joinMutation.mutate(
      { matchingGroupId: groupId, message: values.message || undefined },
      {
        onSuccess: () => {
          toast.success(
            'Đã gửi yêu cầu tham gia thành công! Trưởng nhóm sẽ xét duyệt yêu cầu của bạn.'
          );
          navigate(detailPath);
        },
        onError: (error) =>
          toast.error(
            error instanceof Error ? error.message : 'Có lỗi xảy ra khi gửi yêu cầu tham gia.'
          ),
      }
    );
  }

  if (isOwner) return null;
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="font-semibold text-muted-foreground text-sm">
          Đang tải thông tin nhóm ghép...
        </p>
      </div>
    );
  }
  if (isError || !group) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-8 shadow-lg">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="font-extrabold text-foreground text-xl">Không thể tải thông tin nhóm</h2>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Nhóm ghép bạn đang tìm kiếm không tồn tại hoặc đã bị giải tán.
          </p>
          <AppButton
            onClick={() => navigate(backPath)}
            className="rounded-full px-6 py-2.5 font-bold text-xs"
          >
            Quay lại danh sách
          </AppButton>
        </div>
      </div>
    );
  }

  const currentApplication = group.members.find(
    (member) => String(member.userId) === String(user?.id)
  );
  return (
    <div
      className={
        embedded
          ? 'w-full'
          : 'flex min-h-screen items-center justify-center bg-background px-4 pt-20 pb-16 sm:px-6 lg:px-8'
      }
    >
      <div className="w-full max-w-5xl rounded-[2.5rem] border border-border bg-card p-6 shadow-xl sm:p-10">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <JoinGroupSummary group={group} />
          <JoinGroupApplicationPanel
            existingStatus={currentApplication?.status}
            isPending={joinMutation.isPending}
            onCancel={() => navigate(-1)}
            onViewDetail={() => navigate(detailPath)}
            onSubmit={submitApplication}
          />
        </div>
      </div>
    </div>
  );
}
