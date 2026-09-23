import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Mountain,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import { checkProfileCompleteness, useProfile } from '@/features/profile';
import { AppButton, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { CreateMatchingGroupForm } from '../components/create/CreateMatchingGroupForm';

const ALL_MANDATORY_FIELDS = [
  'Họ và tên',
  'Số điện thoại',
  'Ngày sinh',
  'Cấp độ kinh nghiệm',
  'Độ khó ưa thích',
];

export default function CreateCompanionGroupPage() {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const isGuest = !user;

  const { data: profile, isLoading } = useProfile();
  const completeness = checkProfileCompleteness(profile);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-16 sm:px-6 lg:px-8">
      <div className="relative grid w-full max-w-5xl grid-cols-1 items-stretch gap-8 overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl lg:grid-cols-12">
        <section className="flex min-h-[280px] flex-col justify-end bg-primary p-8 text-primary-foreground lg:col-span-5 lg:min-h-[560px]">
          <h1 className="font-extrabold text-3xl leading-tight tracking-tight">
            Kết nối đam mê,
            <br />
            Chia sẻ hành trình.
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-sm leading-relaxed">
            Tạo nhóm để tìm kiếm những người bạn đồng hành chung chí hướng cho chuyến đi sắp tới của
            bạn.
          </p>
        </section>

        <section className="flex min-w-0 flex-col lg:col-span-7">
          {isLoading ? (
            <div className="flex min-h-[400px] items-center justify-center p-8">
              <AppSpinner size="lg" className="text-primary" />
            </div>
          ) : isGuest ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center sm:p-10">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldAlert className="size-8" />
              </div>
              <h2 className="mt-5 font-bold text-xl text-foreground sm:text-2xl">
                Yêu cầu đăng nhập
              </h2>
              <p className="mt-2 max-w-md text-muted-foreground text-sm leading-relaxed">
                Vui lòng đăng nhập vào tài khoản TrekSphere của bạn để bắt đầu tạo nhóm đồng hành.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(PATHS.GROUPS)}
                  className="rounded-xl border border-border px-5 py-2.5 font-semibold text-sm transition-colors hover:bg-muted"
                >
                  Quay lại
                </button>
                <AppButton
                  type="button"
                  onClick={() => navigate(PATHS.LOGIN)}
                  className="rounded-xl px-6 py-2.5 font-semibold"
                >
                  Đăng nhập ngay
                </AppButton>
              </div>
            </div>
          ) : !completeness.isComplete ? (
            <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
              <div>
                <header className="border-border border-b pb-5">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      <Mountain className="size-5" />
                    </span>
                    <div>
                      <h2 className="font-black text-xl text-foreground tracking-tight sm:text-2xl">
                        Hoàn thiện hồ sơ để tạo nhóm
                      </h2>
                      <p className="mt-0.5 text-muted-foreground text-xs sm:text-sm">
                        Cần bổ sung thông tin trưởng nhóm trước khi mở nhóm ghép.
                      </p>
                    </div>
                  </div>
                </header>

                <div className="mt-5 space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Với vai trò là <strong>Trưởng nhóm (Leader)</strong>, thông tin cá nhân và hồ sơ
                    leo núi minh bạch là điều kiện tiên quyết để các thành viên khác tin tưởng và
                    tham gia nhóm của bạn.
                  </p>

                  <div className="rounded-2xl border border-border bg-muted/40 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <UserCheck className="size-4 text-primary" />
                      Danh mục thông tin bắt buộc
                    </p>

                    <ul className="mt-3 space-y-2 text-left">
                      {ALL_MANDATORY_FIELDS.map((label) => {
                        const isMissing = completeness.missingFieldLabels.includes(label);
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
                </div>
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 border-border border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate(PATHS.GROUPS)}
                  className="rounded-xl border border-border bg-transparent px-5 py-2.5 font-semibold text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
                >
                  Quay lại
                </button>
                <AppButton
                  type="button"
                  onClick={() =>
                    navigate(
                      `${PATHS.EDIT_PROFILE}?returnUrl=${encodeURIComponent(PATHS.GROUPS_CREATE)}`
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-semibold"
                >
                  Cập nhật hồ sơ ngay
                  <ArrowRight className="size-4" />
                </AppButton>
              </div>
            </div>
          ) : (
            <>
              <header className="border-border border-b px-6 py-5">
                <h2 className="font-black text-2xl text-foreground tracking-tight sm:text-3xl">
                  Tạo Nhóm Đồng Hành
                </h2>
                <p className="mt-1 text-muted-foreground text-sm">
                  Điền thông tin bên dưới để bắt đầu tìm kiếm đồng đội.
                </p>
              </header>
              <CreateMatchingGroupForm onCancel={() => navigate(PATHS.GROUPS)} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
