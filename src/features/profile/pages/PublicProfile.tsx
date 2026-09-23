import { useParams } from 'react-router-dom';
import { ProfileScreen } from '../components/profile-view/ProfileScreen';

export default function PublicProfile() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="min-h-screen bg-background pt-16">
      <ProfileScreen mode="public" userId={userId} />
    </div>
  );
}
