import { useNavigate } from 'react-router-dom';
import { PATHS } from '@/constants/paths';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';

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
