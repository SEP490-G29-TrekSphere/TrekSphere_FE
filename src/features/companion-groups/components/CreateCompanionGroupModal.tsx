import { X } from 'lucide-react';
import { AppModalShell } from '@/shared/ui';
import { CreateMatchingGroupForm } from './create/CreateMatchingGroupForm';

interface CreateCompanionGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSourceType?: 'CUSTOM_JOURNEY' | 'TOUR';
  initialTourId?: string;
}

export function CreateCompanionGroupModal({
  isOpen,
  onClose,
  initialSourceType = 'CUSTOM_JOURNEY',
  initialTourId,
}: CreateCompanionGroupModalProps) {
  if (!isOpen) return null;

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Tạo nhóm đồng hành"
      className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden border border-border p-0"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="border-border border-b bg-muted/30 px-6 py-5">
        <h2 className="font-bold text-foreground text-xl">Tạo nhóm đồng hành</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Khởi tạo nhóm mới để tìm kiếm những người bạn cùng chung đam mê khám phá.
        </p>
      </div>

      <CreateMatchingGroupForm
        onCancel={onClose}
        initialSourceType={initialSourceType}
        initialTourId={initialTourId}
      />
    </AppModalShell>
  );
}
