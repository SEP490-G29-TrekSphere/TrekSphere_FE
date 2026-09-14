import { MapPin, X } from 'lucide-react';
import { AppImageUploadGallery, type ImageUploadCleanup } from '@/shared/ui';

export interface CheckpointDraft {
  key: string;
  /** Có giá trị nếu đây là checkpoint đã tồn tại trên server (đổ từ GET khi Sửa). */
  checkpointId?: string;
  name: string;
  description: string;
  /** Lat/lng/altitude để dạng string cho input — parse sang number lúc submit. */
  latitude: string;
  longitude: string;
  altitude: string;
  /** URL ảnh của checkpoint — ảnh chọn từ máy được upload ngay nên ở đây luôn là URL. */
  imageUrls: string[];
}

/**
 * BE lưu toàn bộ ảnh của 1 checkpoint vào đúng 1 cột TEXT `checkpoint_image_url`,
 * nhiều ảnh thì nối URL lại phân tách bởi dấu phẩy. Tách ngược lại để hiển thị.
 */
export function parseCheckpointImageUrls(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);
}

export function createEmptyCheckpointDraft(): CheckpointDraft {
  return {
    key: crypto.randomUUID(),
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    altitude: '',
    imageUrls: [],
  };
}

interface CheckpointFieldsProps {
  checkpoints: CheckpointDraft[];
  onChange: (checkpoints: CheckpointDraft[]) => void;
  /** Dùng chung với ảnh bìa tour để dọn ảnh đã upload nhưng form chưa lưu. */
  imageCleanup: ImageUploadCleanup;
  onUploadingChange?: (isUploading: boolean) => void;
}

const MAX_IMAGE_SIZE_MB = 5;

/** Danh sách checkpoint có thể thêm/xóa/sửa — gửi lên API khi submit form Tạo/Sửa. */
export function CheckpointFields({
  checkpoints,
  onChange,
  imageCleanup,
  onUploadingChange,
}: CheckpointFieldsProps) {
  const handleAdd = () => {
    onChange([...checkpoints, createEmptyCheckpointDraft()]);
  };

  const handleRemove = (key: string) => {
    onChange(checkpoints.filter((checkpoint) => checkpoint.key !== key));
  };

  const handleChange = (key: string, patch: Partial<CheckpointDraft>) => {
    onChange(
      checkpoints.map((checkpoint) =>
        checkpoint.key === key ? { ...checkpoint, ...patch } : checkpoint
      )
    );
  };

  return (
    <div className="space-y-3">
      {checkpoints.map((checkpoint) => (
        <CheckpointRow
          key={checkpoint.key}
          checkpoint={checkpoint}
          imageCleanup={imageCleanup}
          onUploadingChange={onUploadingChange}
          onChange={(patch) => handleChange(checkpoint.key, patch)}
          onRemove={() => handleRemove(checkpoint.key)}
        />
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3 text-sm font-semibold transition-colors"
        style={{ borderColor: '#D8D3C4', color: '#6F7B75' }}
      >
        <MapPin className="h-4 w-4" />
        Thêm checkpoint
      </button>
    </div>
  );
}

interface CheckpointRowProps {
  checkpoint: CheckpointDraft;
  imageCleanup: ImageUploadCleanup;
  onUploadingChange?: (isUploading: boolean) => void;
  onChange: (patch: Partial<CheckpointDraft>) => void;
  onRemove: () => void;
}

function CheckpointRow({
  checkpoint,
  imageCleanup,
  onUploadingChange,
  onChange,
  onRemove,
}: CheckpointRowProps) {
  return (
    <div
      className="relative flex flex-col gap-3 rounded-2xl p-4"
      style={{ backgroundColor: '#F0EEE6' }}
    >
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 transition-colors hover:text-red-500"
        style={{ color: '#6F7B75' }}
        aria-label="Xóa checkpoint"
      >
        <X className="h-4 w-4" />
      </button>

      <AppImageUploadGallery
        label="Ảnh checkpoint"
        value={checkpoint.imageUrls}
        onChange={(imageUrls) => onChange({ imageUrls })}
        folder="checkpoints"
        cleanup={imageCleanup}
        onUploadingChange={onUploadingChange}
        maxSizeMb={MAX_IMAGE_SIZE_MB}
        className="space-y-2 pr-6"
        gridClassName="grid grid-cols-2 gap-2 sm:grid-cols-4"
      />

      <div className="min-w-0 flex-1 space-y-2 pr-6">
        <input
          type="text"
          value={checkpoint.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Tên checkpoint (VD: Trạm nghỉ 2000m)"
          className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm font-semibold focus:outline-none"
          style={{ color: '#06261D' }}
        />
        <textarea
          value={checkpoint.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Mô tả ngắn về checkpoint này..."
          rows={2}
          className="w-full resize-none rounded-xl border-none bg-white px-4 py-2.5 text-sm focus:outline-none"
          style={{ color: '#06261D' }}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.latitude}
            onChange={(e) => onChange({ latitude: e.target.value })}
            placeholder="Vĩ độ (lat)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
            style={{ color: '#06261D' }}
          />
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.longitude}
            onChange={(e) => onChange({ longitude: e.target.value })}
            placeholder="Kinh độ (lng)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
            style={{ color: '#06261D' }}
          />
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.altitude}
            onChange={(e) => onChange({ altitude: e.target.value })}
            placeholder="Độ cao (m)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium focus:outline-none"
            style={{ color: '#06261D' }}
          />
        </div>
      </div>
    </div>
  );
}
