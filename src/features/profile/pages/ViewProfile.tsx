import { PATHS } from '@/constants';
import { ProfileScreen } from '../components/profile-view/ProfileScreen';

/**
 * Hồ sơ của chính người dùng đang đăng nhập (`/profile`, `/trekker/profile`).
 *
 * Toàn bộ bố cục nằm ở `ProfileScreen` — dùng chung với hồ sơ công khai
 * `/users/:userId` để hai màn hình không trôi khỏi nhau khi chỉnh giao diện.
 */
export default function ViewProfile({ editPath }: { editPath?: string }) {
  return <ProfileScreen mode="me" editPath={editPath} />;
}

// Re-export PATHS cho các module khác import luôn nếu cần
export { PATHS };
