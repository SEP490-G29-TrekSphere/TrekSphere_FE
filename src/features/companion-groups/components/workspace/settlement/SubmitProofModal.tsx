import { Image, Loader2, Send } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/store/useToastStore';
import type {
  GroupSettlementProofRequest,
  GroupSettlementResponse,
} from '../../../types/settlement';

interface SubmitProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: GroupSettlementResponse | null;
  onSubmit: (settlementId: string, payload: GroupSettlementProofRequest) => Promise<void>;
  actionLoading: boolean;
}

export const SubmitProofModal: React.FC<SubmitProofModalProps> = ({
  isOpen,
  onClose,
  settlement,
  onSubmit,
  actionLoading,
}) => {
  const [proofUrl, setProofUrl] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản VietQR');
  const [note, setNote] = useState('');

  if (!settlement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofUrl.trim()) {
      toast.error('Vui lòng nhập đường dẫn hoặc link ảnh chứng từ chuyển tiền');
      return;
    }

    try {
      await onSubmit(settlement.groupSettlementId, {
        proofUrl: proofUrl.trim(),
        paymentMethod: paymentMethod.trim() || undefined,
        note: note.trim() || undefined,
      });
      onClose();
      setProofUrl('');
      setNote('');
    } catch {
      // Handled in hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-black text-foreground">
              Nộp chứng từ chuyển tiền
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Target Payee & Amount Info */}
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Người nhận (Payee):</span>
              <span className="font-bold text-foreground">{settlement.toMember.fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Số tiền quyết toán:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {settlement.amount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Phương thức thanh toán</Label>
            <Input
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="VD: VietQR, Chuyển khoản ngân hàng, Tiền mặt"
              className="text-xs"
            />
          </div>

          {/* Proof Image URL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Link ảnh biên lai / Bill chuyển tiền <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://... ảnh bill chuyển khoản"
                className="text-xs pl-8"
                required
              />
              <Image className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {proofUrl && (
              <div className="mt-2 relative rounded-lg border border-border overflow-hidden max-h-36 bg-black/5 flex items-center justify-center">
                <img
                  src={proofUrl}
                  alt="Bill Preview"
                  className="max-h-36 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/400x200?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Ghi chú thêm</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Em đã ck qua VietinBank lúc 14:30 ạ..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={actionLoading}
              className="text-xs font-bold"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={actionLoading || !proofUrl.trim()}
              className="text-xs font-bold gap-1.5"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang nộp...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Gửi chứng từ
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
