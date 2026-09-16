import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';

/**
 * Chặn 1 hành động cần đăng nhập khi viewer đang là Guest (chưa login) — cảnh báo bằng toast rồi
 * điều hướng sang trang đăng nhập. Trả về `true` nếu đã đăng nhập (hành động được phép tiếp tục).
 */
export function useRequireLogin(message = 'Vui lòng đăng nhập để tham gia nhóm ghép.') {
  const user = useAppStore((state) => state.user);
  const navigate = useNavigate();

  return () => {
    if (user) return true;
    toast.warning(message);
    navigate(PATHS.LOGIN);
    return false;
  };
}
