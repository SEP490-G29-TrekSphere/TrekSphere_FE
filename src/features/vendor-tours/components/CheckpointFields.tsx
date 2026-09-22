import { MapPin, X } from 'lucide-react';
import { AppImageUploadGallery, type ImageUploadCleanup } from '@/shared/ui';

export interface CheckpointDraft {
  key: string;

  checkpointId?: string;
  name: string;
  description: string;

  latitude: string;
  longitude: string;
  altitude: string;

  imageUrls: string[];
}

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

  imageCleanup: ImageUploadCleanup;
  onUploadingChange?: (isUploading: boolean) => void;
}

const MAX_IMAGE_SIZE_MB = 5;

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
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
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
    <div className="relative flex flex-col gap-3 rounded-2xl bg-muted/60 p-4">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-3 top-3 text-muted-foreground transition-colors hover:text-destructive"
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
          className="w-full rounded-xl border-none bg-white px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none"
        />
        <textarea
          value={checkpoint.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Mô tả ngắn về checkpoint này..."
          rows={2}
          className="w-full resize-none rounded-xl border-none bg-white px-4 py-2.5 text-sm text-foreground focus:outline-none"
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.latitude}
            onChange={(e) => onChange({ latitude: e.target.value })}
            placeholder="Vĩ độ (lat)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.longitude}
            onChange={(e) => onChange({ longitude: e.target.value })}
            placeholder="Kinh độ (lng)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
          />
          <input
            type="number"
            inputMode="decimal"
            value={checkpoint.altitude}
            onChange={(e) => onChange({ altitude: e.target.value })}
            placeholder="Độ cao (m)"
            className="w-full rounded-xl border-none bg-white px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
