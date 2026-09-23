import PublicHeader from '@/features/home/components/PublicHeader';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { SecurityTipsPanel } from '../components/SecurityTipsPanel';

export default function ChangePassword() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />

      <main className="flex-1 px-4 pt-28 pb-16">
        <div className="mx-auto grid w-full max-w-4xl gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
          <ChangePasswordForm />
          <SecurityTipsPanel className="lg:sticky lg:top-28" />
        </div>
      </main>
    </div>
  );
}
