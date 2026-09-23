import { getTrekkerGroupDetailPath, PATHS } from '@/constants';
import ViewProfile from '@/features/profile/pages/ViewProfile';

export default function TrekkerViewProfile() {
  return (
    <ViewProfile
      editPath={PATHS.TREKKER_PROFILE_EDIT}
      changePasswordPath={PATHS.TREKKER_CHANGE_PASSWORD}
      groupDetailPath={getTrekkerGroupDetailPath}
      fluid
    />
  );
}
