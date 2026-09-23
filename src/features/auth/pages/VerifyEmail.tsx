import { Mail } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { PATHS } from '@/constants';
import { authService, toAppStoreUser } from '@/features/auth';
import { AppButton, AppSpinner } from '@/shared/ui';
import { useAppStore } from '@/store/useAppStore';
import { storage } from '@/utils/storage';
import AuthLayout from '../components/AuthLayout';
import { VerifyEmailPendingView } from '../components/VerifyEmailPendingView';

const VERIFY_IMAGE = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80';

type VerifyStatus = 'idle' | 'loading' | 'success' | 'error';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const emailFromQuery = searchParams.get('email');
  const emailFromState = (location.state as { email?: string } | null)?.email;
  const email = emailFromQuery || emailFromState || '';

  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const redirectTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      setStatus('loading');
      try {
        const result = await authService.verifyEmail(token);

        if (result.error && (result.status === 401 || result.status === 400)) {
          setStatus('error');
          setErrorMessage(result.error || 'Token không hợp lệ hoặc đã hết hạn.');
          return;
        }

        if (result.error) {
          setStatus('error');
          setErrorMessage(result.error || 'Xác thực thất bại. Vui lòng thử lại.');
          return;
        }

        const data = result.data;
        const accessToken = data?.access_token;
        const refreshToken = data?.refresh_token;
        const verifiedUser = data?.user;

        if (accessToken) {
          storage.set('accessToken', accessToken);
        }
        if (refreshToken) {
          storage.set('refreshToken', refreshToken);
        }

        if (verifiedUser) {
          useAppStore.getState().setUser(toAppStoreUser(verifiedUser));
        }

        setStatus('success');
      } catch (err) {
        console.error('[VerifyEmail] verify threw:', err);
        setStatus('error');
        setErrorMessage('Đã xảy ra lỗi khi xác thực. Vui lòng thử lại sau.');
      }
    };

    verify();
  }, [token]);

  const goToLogin = useCallback(() => {
    navigate(PATHS.LOGIN, {
      replace: true,
      state: email ? { registeredEmail: email } : undefined,
    });
  }, [navigate, email]);

  useEffect(() => {
    if (status !== 'success') return;
    redirectTimeoutRef.current = window.setTimeout(() => {
      goToLogin();
    }, 3000);
    return () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    };
  }, [status, goToLogin]);

  const handleSuccessAction = () => {
    if (redirectTimeoutRef.current !== null) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
    goToLogin();
  };

  if (!token && email) {
    return (
      <AuthLayout
        title="Xác thực email"
        subtitle="Chỉ còn một bước nữa để kích hoạt tài khoản của bạn."
        footerText="Đã có tài khoản?"
        footerLink={{ label: 'Đăng nhập', to: PATHS.LOGIN }}
        image={VERIFY_IMAGE}
        variant="register"
      >
        <VerifyEmailPendingView email={email} />
      </AuthLayout>
    );
  }

  if (!token && !email) {
    return (
      <AuthLayout
        title="Xác thực email"
        subtitle="Không tìm thấy mã xác thực hợp lệ."
        footerText="Đã có tài khoản?"
        footerLink={{ label: 'Đăng nhập ngay', to: PATHS.LOGIN }}
        image={VERIFY_IMAGE}
        variant="register"
      >
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
              <Mail className="h-8 w-8 text-amber-700" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#1F3933]">Liên kết xác thực không hợp lệ</h3>
            <p className="text-sm text-[#6F7B75]">
              Liên kết có thể đã hết hạn hoặc bị thiếu mã token. Vui lòng kiểm tra lại email hoặc
              đăng nhập/đăng ký tài khoản mới.
            </p>
          </div>
          <div className="space-y-3">
            <AppButton
              onClick={() => navigate(PATHS.LOGIN)}
              className="w-full h-11 rounded-full text-white font-semibold text-sm bg-[#06261D] hover:bg-[#06261D]/90"
            >
              Quay lại đăng nhập
            </AppButton>
            <AppButton
              variant="outline"
              onClick={() => navigate(PATHS.REGISTER)}
              className="w-full h-11 rounded-full font-semibold text-sm border-gray-300"
            >
              Đăng ký tài khoản mới
            </AppButton>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Xác thực email"
      subtitle="Chúng tôi đang xác minh địa chỉ email của bạn."
      footerText="Đã xác thực?"
      footerLink={{ label: 'Đăng nhập ngay', to: PATHS.LOGIN }}
      image={VERIFY_IMAGE}
      variant="register"
    >
      <div className="space-y-6 text-center">
        {status === 'idle' || status === 'loading' ? (
          <>
            <div className="flex justify-center">
              <AppSpinner size="lg" className="text-[#1F3933]" />
            </div>
            <p className="text-sm" style={{ color: '#6F7B75' }}>
              Đang xác thực email của bạn, vui lòng chờ...
            </p>
          </>
        ) : status === 'success' ? (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#1F3933' }}>
                Xác thực thành công!
              </h3>
              <p className="mt-2 text-sm" style={{ color: '#6F7B75' }}>
                Email của bạn đã được xác thực. Đang đưa bạn về trang đăng nhập...
              </p>
            </div>
            <AppButton
              onClick={handleSuccessAction}
              className="w-full h-12 rounded-full text-white font-semibold text-sm
                bg-[#06261D] hover:bg-[#06261D]/90"
            >
              Đăng nhập ngay
            </AppButton>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#1F3933' }}>
                Xác thực thất bại
              </h3>
              <p className="mt-2 text-sm" style={{ color: '#6F7B75' }}>
                {errorMessage}
              </p>
            </div>
            <AppButton
              onClick={() => {
                navigate(PATHS.LOGIN);
              }}
              className="w-full h-12 rounded-full text-white font-semibold text-sm
                bg-[#06261D] hover:bg-[#06261D]/90"
            >
              Quay lại đăng nhập
            </AppButton>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
