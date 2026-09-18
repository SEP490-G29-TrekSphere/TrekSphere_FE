import { ArrowRight, CheckCircle2, ExternalLink, Mail, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService } from '@/features/auth/services/authService';
import { AppButton, AppSpinner } from '@/shared/ui';
import { toast } from '@/store/useToastStore';

interface VerifyEmailPendingViewProps {
  email: string;
}

interface MailProviderInfo {
  name: string;
  url: string;
}

function getMailProvider(email: string): MailProviderInfo | null {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return null;

  if (domain === 'gmail.com') {
    return { name: 'Gmail', url: 'https://mail.google.com' };
  }
  if (['outlook.com', 'hotmail.com', 'live.com'].includes(domain)) {
    return { name: 'Outlook', url: 'https://outlook.live.com' };
  }
  if (['yahoo.com', 'yahoo.com.vn'].includes(domain)) {
    return { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' };
  }
  if (domain === 'icloud.com') {
    return { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' };
  }
  return null;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmailPendingView({ email }: VerifyEmailPendingViewProps) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (countdown <= 0) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current !== null) {
            window.clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      const result = await authService.resendVerification(email);
      if (result.error || (result.status && result.status >= 400)) {
        toast.error(result.error || 'Không thể gửi lại email xác thực. Vui lòng thử lại sau.');
        return;
      }

      toast.success('Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư.');
      setCountdown(RESEND_COOLDOWN_SECONDS);
    } catch {
      toast.error('Đã xảy ra lỗi khi gửi lại email. Vui lòng thử lại sau.');
    } finally {
      setIsResending(false);
    }
  };

  const mailProvider = getMailProvider(email);

  return (
    <div className="space-y-6 text-center">
      {/* Visual Header Icon */}
      <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 shadow-inner border border-emerald-100">
        <Mail className="h-10 w-10 text-emerald-700" />
        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-2 ring-white">
          <CheckCircle2 className="h-4 w-4" />
        </span>
      </div>

      {/* Title & Email Info */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-[#06261D]">
          Kiểm tra hộp thư của bạn
        </h3>
        <p className="text-sm text-[#4B5563]">
          Chúng tôi đã gửi một liên kết kích hoạt tài khoản đến:
        </p>
        <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3.5 py-1.5 border border-emerald-200/80 max-w-full">
          <Mail className="h-4 w-4 text-emerald-700 shrink-0" />
          <span className="font-semibold text-emerald-900 text-sm truncate">{email}</span>
        </div>
      </div>

      {/* Step by step guide */}
      <div className="rounded-xl bg-[#FAF8F1] p-4 text-left border border-[#E5E0D8]/80 space-y-2.5 text-xs text-[#525B56]">
        <div className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#06261D] text-[11px] font-bold text-white">
            1
          </span>
          <span className="pt-0.5">
            Mở thư từ <strong>TrekSphere</strong> và nhấn vào nút <strong>Xác thực email</strong>.
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#06261D] text-[11px] font-bold text-white">
            2
          </span>
          <span className="pt-0.5">
            Nếu chưa thấy trong Hộp thư đến, vui lòng kiểm tra thư mục{' '}
            <strong>Spam / Thư rác</strong>.
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#06261D] text-[11px] font-bold text-white">
            3
          </span>
          <span className="pt-0.5">
            Sau khi xác thực xong, nhấn nút <strong>Tôi đã xác thực — Đăng nhập</strong> bên dưới.
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        {mailProvider && (
          <a
            href={mailProvider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white font-semibold text-sm text-[#06261D] hover:bg-emerald-50/50 transition-colors shadow-xs"
          >
            <ExternalLink className="h-4 w-4 text-emerald-700" />
            Mở {mailProvider.name}
          </a>
        )}

        <AppButton
          onClick={() => navigate(PATHS.LOGIN, { state: { registeredEmail: email } })}
          className="w-full h-11 rounded-full text-white font-semibold text-sm bg-[#06261D] hover:bg-[#06261D]/90 shadow-sm flex items-center justify-center gap-2"
        >
          <span>Tôi đã xác thực — Đăng nhập</span>
          <ArrowRight className="h-4 w-4" />
        </AppButton>
      </div>

      {/* Resend & Change email */}
      <div className="pt-2 border-t border-gray-100 flex flex-col items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span>Chưa nhận được thư?</span>
          <button
            type="button"
            disabled={isResending || countdown > 0}
            onClick={handleResend}
            className="font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
          >
            {isResending ? (
              <>
                <AppSpinner size="sm" />
                <span>Đang gửi...</span>
              </>
            ) : countdown > 0 ? (
              <span>Gửi lại sau ({countdown}s)</span>
            ) : (
              <>
                <RotateCw className="h-3 w-3" />
                <span>Gửi lại email xác thực</span>
              </>
            )}
          </button>
        </div>

        <Link to={PATHS.REGISTER} className="text-gray-400 hover:text-gray-600 transition-colors">
          Nhập sai email? Đăng ký lại
        </Link>
      </div>
    </div>
  );
}
