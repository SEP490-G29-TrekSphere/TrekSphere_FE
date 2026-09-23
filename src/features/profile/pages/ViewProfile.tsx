import { PATHS } from '@/constants';
import { ProfileScreen } from '../components/profile-view/ProfileScreen';

export default function ViewProfile({
  editPath,
  changePasswordPath,
  fluid = false,
  groupDetailPath,
}: {
  editPath?: string;
  changePasswordPath?: string;
  fluid?: boolean;
  groupDetailPath?: (groupId: string) => string;
}) {
  return (
    <ProfileScreen
      mode="me"
      editPath={editPath}
      changePasswordPath={changePasswordPath}
      fluid={fluid}
      groupDetailPath={groupDetailPath}
    />
  );
}

export { PATHS };
