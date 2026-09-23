import { AlertCircle, ArrowRight, CheckCircle2, Mountain, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import { AppButton, AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

export interface ProfileCompletionModalProps {
  open: boolean;
  onClose?: () => void;
  missingFieldLabels?: string[];
  returnPath?: string;
  actionText?: string;
  cancelText?: string;
  title?: string;
  description?: string;
  warningOnClose?: string;
  /**
   * Khi bắt buộc hoàn thiện hồ sơ:
   * - Không đóng khi bấm ra ngoài (click outside) hay bấm phím Esc.
   * - Khi bấm nút Đóng/Quay lại, tự động chuyển về trang trước đó và hiện thông báo nhắc nhở.
   */
  isMandatory?: boolean;
}

const ALL_MANDATORY_FIELDS = [
  'Họ và tên',
  'Số điện thoại',
  'Ngày sinh',
  'Cấp độ kinh nghiệm',
  'Độ khó ưa thích',
];

export function ProfileCompletionModal({
  open,
  onClose,
  missingFieldLabels = [],
  returnPath,
  actionText = 'Cập nhật hồ sơ ngay',
  cancelText = 'Quay lại',
  title = 'Yêu cầu hoàn thiện hồ sơ',
  description = 'Để tham gia hoặc tạo nhóm ghép đồng hành an toàn và uy tín, bạn cần cung cấp đầy đủ thông tin cá nhân và hồ sơ leo núi cơ bản.',
  warningOnClose = 'Bạn chưa hoàn thành thông tin hồ sơ bắt buộc nên chưa thể xem và truy cập tính năng nhóm đồng hành.',
  isMandatory = true,
}: ProfileCompletionModalProps) {
  const navigate = useNavigate();

  const handleNavigateToEdit = () => {
    onClose?.();
    const targetPath = returnPath
      ? `${PATHS.EDIT_PROFILE}?returnUrl=${encodeURIComponent(returnPath)}`
      : PATHS.EDIT_PROFILE;
    navigate(targetPath);
  };

  const handleClose = () => {
    onClose?.();
    if (isMandatory) {
      if (warningOnClose) {
        toast.warning(warningOnClose);
      }
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(PATHS.HOME);
      }
    }
  };

  return (
    <AppModalShell
      open={open}
      onClose={handleClose}
      showCloseButton
      closeOnBackdropClick={!isMandatory}
      closeOnEscape={!isMandatory}
      className="max-w-lg rounded-3xl p-6 sm:p-7"
    >
      <div className="flex flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
          <Mountain className="size-7" />
        </div>

        <h3 className="mt-4 text-xl font-bold text-foreground sm:text-2xl">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <UserCheck className="size-4 text-primary" />
          Danh mục thông tin bắt buộc
        </p>

        <ul className="mt-3 space-y-2 text-left">
          {ALL_MANDATORY_FIELDS.map((label) => {
            const isMissing = missingFieldLabels.includes(label);
            return (
              <li
                key={label}
                className="flex items-center justify-between rounded-xl bg-card px-3.5 py-2.5 text-sm font-medium shadow-xs"
              >
                <span className="flex items-center gap-2 text-foreground">
                  {isMissing ? (
                    <AlertCircle className="size-4 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                  )}
                  {label}
                </span>
                {isMissing ? (
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Chưa cập nhật
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Đã hoàn thành
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleClose}
          className="cursor-pointer rounded-xl border border-border bg-transparent px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {cancelText}
        </button>
        <AppButton
          type="button"
          onClick={handleNavigateToEdit}
          className="flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-semibold"
        >
          {actionText}
          <ArrowRight className="size-4" />
        </AppButton>
      </div>
    </AppModalShell>
  );
}
