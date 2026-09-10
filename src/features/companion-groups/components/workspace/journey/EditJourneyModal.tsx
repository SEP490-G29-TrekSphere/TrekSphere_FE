import { Loader2, Pencil, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppModalShell } from '@/shared/ui';
import { toast } from '@/store/useToastStore';
import { useUpdateGroupJourney } from '../../../hooks/useGroupJourneyWorkspace';
import type { JourneyDifficulty } from '../../../types/matchingGroup';
import type { CustomJourneyDetailResponse } from '../../../types/workspace';

interface EditJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  journey: CustomJourneyDetailResponse | null | undefined;
}

const DIFFICULTY_OPTIONS: { value: JourneyDifficulty; label: string }[] = [
  { value: 'EASY', label: 'Dễ (Mọi lứa tuổi)' },
  { value: 'MODERATE', label: 'Trung bình (Yêu cầu thể lực cơ bản)' },
  { value: 'HARD', label: 'Thử thách / Khó (Có kinh nghiệm trekking)' },
  { value: 'EXTREME', label: 'Cực kỳ khắc nghiệt (Chuyên gia / Chuyên nghiệp)' },
];

export function EditJourneyModal({ isOpen, onClose, groupId, journey }: EditJourneyModalProps) {
  const updateJourney = useUpdateGroupJourney(groupId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<JourneyDifficulty>('MODERATE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (journey) {
      setTitle(journey.title || '');
      setDescription(journey.description || '');
      setDifficulty(journey.difficulty || 'MODERATE');
      setStartDate(journey.startDate || '');
      setEndDate(journey.endDate || '');
    }
  }, [journey]);

  if (!isOpen || !journey) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Vui lòng nhập tên hành trình');
      return;
    }

    updateJourney.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        difficulty,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Cập nhật thông tin lộ trình thành công!');
          onClose();
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Không thể cập nhật hành trình. Vui lòng thử lại!');
        },
      }
    );
  }

  return (
    <AppModalShell
      open
      onClose={onClose}
      aria-label="Chỉnh sửa thông tin lộ trình"
      className="flex max-w-lg flex-col overflow-hidden border border-border p-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Pencil className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Chỉnh sửa thông tin hành trình</h3>
            <p className="text-[11px] text-muted-foreground">
              Cập nhật tên, độ khó và mô tả tổng quan cho chuyến đi
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={updateJourney.isPending}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="max-h-[70vh] space-y-3.5 overflow-y-auto px-5 py-4 text-xs">
          {/* Tên hành trình */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">
              Tên hành trình / Chuyến đi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="VD: Chinh phục đỉnh Fansipan 3N2Đ"
            />
          </div>

          {/* Độ khó */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Độ khó của tuyến đường</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as JourneyDifficulty)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Row: Ngày bắt đầu & Ngày kết thúc */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-foreground">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-foreground">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Mô tả tổng quan */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">Mô tả hành trình</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Thông tin tổng quan về cung đường, cảnh báo an toàn và mục tiêu chuyến đi..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updateJourney.isPending}
            className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={updateJourney.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            {updateJourney.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </AppModalShell>
  );
}
