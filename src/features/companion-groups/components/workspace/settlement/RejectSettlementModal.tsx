import { AlertCircle, Loader2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/store/useToastStore';
import type {
  GroupSettlementRejectRequest,
  GroupSettlementResponse,
} from '../../../types/settlement';

interface RejectSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: GroupSettlementResponse | null;
  onReject: (settlementId: string, payload: GroupSettlementRejectRequest) => Promise<void>;
  actionLoading: boolean;
}

export const RejectSettlementModal: React.FC<RejectSettlementModalProps> = ({
  isOpen,
  onClose,
  settlement,
  onReject,
  actionLoading,
}) => {
  const [reason, setReason] = useState('');

  if (!settlement) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Vui lòng nhập lý do từ chối rõ ràng (ít nhất 5 ký tự)');
      return;
    }

    try {
      await onReject(settlement.groupSettlementId, {
        reason: reason.trim(),
        rejectReason: reason.trim(),
      });
      onClose();
      setReason('');
    } catch {
      // Handled in hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-black text-destructive flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Từ chối xác nhận chuyển tiền
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bạn đang từ chối khoản quyết toán từ{' '}
            <strong className="text-foreground">{settlement.fromMember.fullName}</strong> số tiền{' '}
            <strong className="text-foreground">
              {settlement.amount.toLocaleString('vi-VN')} đ
            </strong>
            . Người nợ sẽ nhận được thông báo kèm lý do của bạn để thực hiện lại.
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Lý do từ chối <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Chưa nhận được biến động số dư tài khoản ngân hàng, hoặc bill mờ..."
              rows={3}
              className="text-xs resize-none"
              required
            />
          </div>

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
              variant="destructive"
              size="sm"
              disabled={actionLoading || !reason.trim()}
              className="text-xs font-bold gap-1.5"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang từ chối...
                </>
              ) : (
                'Xác nhận từ chối'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
