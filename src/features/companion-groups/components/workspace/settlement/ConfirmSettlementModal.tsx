import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import type React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { GroupSettlementResponse } from '../../../types/settlement';

interface ConfirmSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: GroupSettlementResponse | null;
  onConfirm: (settlementId: string) => Promise<void>;
  actionLoading: boolean;
}

export const ConfirmSettlementModal: React.FC<ConfirmSettlementModalProps> = ({
  isOpen,
  onClose,
  settlement,
  onConfirm,
  actionLoading,
}) => {
  if (!settlement) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm(settlement.groupSettlementId);
      onClose();
    } catch {
      // Handled in hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Xác nhận đã nhận tiền
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Vui lòng kiểm tra kỹ tài khoản ngân hàng hoặc tiền mặt trước khi xác nhận. Sau khi xác
            nhận, lệnh quyết toán sẽ hoàn tất và các khoản chia nợ liên quan sẽ được đóng.
          </p>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Người gửi:</span>
              <span className="font-bold text-foreground">{settlement.fromMember.fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Số tiền:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                {settlement.amount.toLocaleString('vi-VN')} đ
              </span>
            </div>
            {settlement.paymentMethod && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Phương thức:</span>
                <span className="font-medium text-foreground">{settlement.paymentMethod}</span>
              </div>
            )}
            {settlement.note && (
              <div className="flex justify-between items-start">
                <span className="text-muted-foreground font-medium">Ghi chú:</span>
                <span className="text-xs text-foreground italic max-w-[200px] text-right">
                  "{settlement.note}"
                </span>
              </div>
            )}
          </div>

          {settlement.proofUrl && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Chứng từ đính kèm:</span>
                <a
                  href={settlement.proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                >
                  Xem ảnh gốc <ExternalLink className="h-3 w-3" />
                </a>
              </span>
              <div className="relative rounded-lg border border-border overflow-hidden max-h-40 bg-black/5 flex items-center justify-center">
                <img
                  src={settlement.proofUrl}
                  alt="Proof"
                  className="max-h-40 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://placehold.co/400x200?text=Invalid+Image';
                  }}
                />
              </div>
            </div>
          )}

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
              type="button"
              size="sm"
              onClick={handleConfirm}
              disabled={actionLoading}
              className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang xác nhận...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Đã nhận đủ tiền
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
