import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';
import { SecurityTipsPanel } from '@/features/auth/components/SecurityTipsPanel';

export default function TrekkerChangePassword() {
  return (
    <div className="grid w-full gap-6 pb-12 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
      <ChangePasswordForm />
      <SecurityTipsPanel />
    </div>
  );
}
