import { useParams } from 'react-router-dom';
import { ProfileScreen } from '../components/profile-view/ProfileScreen';

/**
 * Hồ sơ công khai của một người dùng khác (`/users/:userId`) —
 * mở khi bấm vào tên tác giả trong community feed.
 *
 * Nằm trong `PublicLayout` (header cố định cao 64px) nên cần `pt-16`,
 * cùng quy ước với các trang public khác.
 */
export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="min-h-screen bg-background pt-16">
      <ProfileScreen mode="public" userId={userId} />
    </div>
  );
}
