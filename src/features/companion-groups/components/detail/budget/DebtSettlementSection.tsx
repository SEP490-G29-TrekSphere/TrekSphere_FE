import {
  AlertCircle,
  ArrowRightLeft,
  Calculator,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  Upload,
  XCircle,
} from 'lucide-react';
import type {
  GroupSettlementResponse,
  MemberBalanceResponse,
  SettlementSuggestionResponse,
} from '../../../types/settlement';
import { MemberAvatar } from '../MemberAvatar';

export interface DebtSettlementSectionProps {
  memberBalances: MemberBalanceResponse[];
  displaySettlements: (GroupSettlementResponse | SettlementSuggestionResponse)[];
  persistedSettlements: GroupSettlementResponse[];
  suggestedSettlements: SettlementSuggestionResponse[];
  totalActualSpent: number;
  avgActualSpentPerPerson: number;
  currentUserId?: string;
  isLeader: boolean;
  isCancelled?: boolean;
  actionLoading: boolean;
  onGenerateSettlements: () => void;
  onViewDetail: (st: GroupSettlementResponse) => void;
  onSubmitProof: (st: GroupSettlementResponse) => void;
  onConfirmSettlement: (st: GroupSettlementResponse) => void;
  onRejectSettlement: (st: GroupSettlementResponse) => void;
}

export function DebtSettlementSection({
  memberBalances,
  displaySettlements,
  persistedSettlements,
  suggestedSettlements,
  totalActualSpent,
  avgActualSpentPerPerson,
  currentUserId,
  isLeader,
  isCancelled = false,
  actionLoading,
  onGenerateSettlements,
  onViewDetail,
  onSubmitProof,
  onConfirmSettlement,
  onRejectSettlement,
}: DebtSettlementSectionProps) {
  return (
    <div id="settlements-section" className="space-y-5 scroll-mt-24">
      {/* Member Net Balances List */}
      {memberBalances && memberBalances.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Bảng Số Dư Công Nợ Thành Viên ({memberBalances.length} người)
            </h4>
            <span className="text-[11px] text-muted-foreground italic">
              Số dư = Đã ứng trước - Phần phải chịu
            </span>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-background overflow-hidden">
            {memberBalances.map((mb) => {
              const isCurrentUser = mb.member.userId === currentUserId;
              const isCreditor = mb.balanceType === 'CREDITOR' || mb.netBalance > 0.01;
              const isDebtor = mb.balanceType === 'DEBTOR' || mb.netBalance < -0.01;

              return (
                <div
                  key={mb.member.matchingMemberId}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 text-xs hover:bg-muted/30 transition-colors ${
                    isCurrentUser ? 'bg-primary/5' : ''
                  }`}
                >
                  {/* Member Info */}
                  <div className="flex items-center gap-3">
                    <MemberAvatar
                      fullName={mb.member.fullName}
                      avatarUrl={mb.member.avatarUrl ?? undefined}
                      size="md"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground text-sm">
                          {mb.member.fullName}
                        </span>
                        {isCurrentUser && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.2 text-[9px] font-black text-primary">
                            Bạn
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-medium">
                          • {mb.member.role === 'LEADER' ? 'Trưởng nhóm' : 'Thành viên'}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>
                          Đã ứng:{' '}
                          <strong className="text-foreground font-semibold">
                            {mb.totalPaid.toLocaleString('vi-VN')}đ
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Phần phải chịu:{' '}
                          <strong className="text-foreground font-semibold">
                            {mb.totalShare.toLocaleString('vi-VN')}đ
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Net Balance & Status Badge */}
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-border/40 sm:border-0">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold">
                        Số dư ròng
                      </div>
                      <div
                        className={`text-sm font-black ${
                          isCreditor
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isDebtor
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {mb.netBalance > 0.01
                          ? `+${mb.netBalance.toLocaleString('vi-VN')}đ`
                          : mb.netBalance < -0.01
                            ? `${mb.netBalance.toLocaleString('vi-VN')}đ`
                            : '0đ'}
                      </div>
                    </div>

                    <div className="min-w-[95px] text-center">
                      {isCreditor ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Được nhận lại
                        </span>
                      ) : isDebtor ? (
                        <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Cần thanh toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground border border-border">
                          Đã cân bằng
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Greedy Debt Settlement Banner */}
      <div
        id="settlements-section"
        className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-4 scroll-mt-24"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs sm:text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Kết Quả Tối Ưu Hóa Giao Dịch Bù Trừ:
          </div>
          {isLeader && !isCancelled && suggestedSettlements.length > 0 && (
            <button
              type="button"
              onClick={onGenerateSettlements}
              disabled={actionLoading}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
            >
              {persistedSettlements.length > 0 ? 'Cập nhật quyết toán' : 'Khởi tạo quyết toán'}
            </button>
          )}
        </div>

        <div className="text-xs text-foreground leading-relaxed space-y-1.5 border-t border-emerald-500/20 pt-3">
          <div>
            • Tổng chi thực tế cả đoàn:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-black">
              {totalActualSpent.toLocaleString('vi-VN')}đ
            </strong>{' '}
            (Trung bình{' '}
            <strong className="text-foreground">
              {avgActualSpentPerPerson.toLocaleString('vi-VN')}đ / Trekker
            </strong>
            ).
          </div>
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
            <ArrowRightLeft className="h-4 w-4 text-emerald-600 shrink-0" />
            Đã tối ưu hóa còn {displaySettlements.length} giao dịch trực tiếp giữa các thành viên:
          </div>
        </div>

        {/* Detailed P2P Settlement Transactions */}
        <div className="space-y-2.5 pt-1">
          <h4 className="text-[11px] font-extrabold tracking-wider uppercase text-emerald-900 dark:text-emerald-300">
            Danh Sách Giao Dịch Bù Trừ NỢ TRỰC TIẾP
          </h4>
          <div className="divide-y divide-emerald-500/20 rounded-xl border border-emerald-500/20 bg-background/80 overflow-hidden">
            {displaySettlements.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Chưa có giao dịch bù trừ nào cần thực hiện (Tất cả đã cân bằng).
              </div>
            ) : (
              displaySettlements.map((st, idx) => {
                const isDebtor = st.fromMember.userId === currentUserId;
                const isPayee = st.toMember.userId === currentUserId;
                const isPersisted = 'groupSettlementId' in st;
                const persistedSt = isPersisted ? (st as GroupSettlementResponse) : null;

                return (
                  <div
                    key={persistedSt ? persistedSt.groupSettlementId : `suggest-${idx}`}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground text-xs">
                          {st.fromMember.fullName}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          chuyển cho
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          {st.toMember.fullName}
                        </span>
                        <span className="font-black text-rose-600 text-xs bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          {st.amount.toLocaleString('vi-VN')}đ
                        </span>
                      </div>

                      {persistedSt && (
                        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Hạn thanh toán: Sau khi kết thúc chuyến đi
                          </span>
                          {persistedSt.status === 'REJECTED' && persistedSt.rejectReason && (
                            <div className="mt-1 rounded-lg bg-destructive/10 border border-destructive/20 px-2.5 py-1 text-[11px] text-destructive flex items-start gap-1.5 font-medium">
                              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>
                                <strong>Lý do từ chối:</strong> {persistedSt.rejectReason}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="w-full sm:w-auto flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t border-emerald-500/20 sm:border-0 flex-wrap">
                      {persistedSt ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onViewDetail(persistedSt)}
                            title="Xem chi tiết giao dịch"
                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {persistedSt.status === 'CONFIRMED' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                              <CheckCircle2 className="h-4 w-4" /> Đã hoàn tất
                            </span>
                          )}

                          {persistedSt.status === 'PROOF_SUBMITTED' && !isPayee && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                              <Send className="h-3.5 w-3.5" /> Đã gửi chứng từ (Chờ xác nhận)
                            </span>
                          )}

                          {persistedSt.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 px-3 py-1.5 rounded-xl border border-destructive/20">
                              <XCircle className="h-3.5 w-3.5" /> Bị từ chối
                            </span>
                          )}

                          {isDebtor && persistedSt.status === 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => onSubmitProof(persistedSt)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-[11px] transition shadow-xs cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5" /> Nộp lại chứng từ
                            </button>
                          )}

                          {isDebtor && persistedSt.status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => onSubmitProof(persistedSt)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] transition shadow-xs cursor-pointer"
                            >
                              <Upload className="h-3.5 w-3.5" /> Nộp chứng từ
                            </button>
                          )}

                          {isPayee && persistedSt.status === 'PROOF_SUBMITTED' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onRejectSettlement(persistedSt)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 font-bold text-[11px] transition cursor-pointer"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Từ chối
                              </button>
                              <button
                                type="button"
                                onClick={() => onConfirmSettlement(persistedSt)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Xác nhận đã nhận
                              </button>
                            </div>
                          )}

                          {persistedSt.status === 'PENDING' && !isDebtor && (
                            <span className="text-[11px] font-bold text-muted-foreground italic px-2">
                              Chờ chuyển tiền
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 italic px-2">
                          Đề xuất tối ưu
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
