import {
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
  GroupSettlementSummaryResponse,
  SettlementSuggestionResponse,
} from '../../../types/settlement';
import { MemberAvatar } from '../MemberAvatar';

interface GroupSettlementSectionProps {
  settlementSummary: GroupSettlementSummaryResponse | null;
  displaySettlements: (GroupSettlementResponse | SettlementSuggestionResponse)[];
  persistedSettlements: GroupSettlementResponse[];
  suggestedSettlements: SettlementSuggestionResponse[];
  totalActualSpent: number;
  avgActualSpentPerPerson: number;
  currentUserId?: string;
  isLeader: boolean;
  isCancelled: boolean;
  actionLoading: boolean;
  onGenerateSettlements: () => void;
  onViewSettlementDetail: (settlement: GroupSettlementResponse) => void;
  onOpenProof: (settlement: GroupSettlementResponse) => void;
  onOpenConfirm: (settlement: GroupSettlementResponse) => void;
  onOpenReject: (settlement: GroupSettlementResponse) => void;
}

export function GroupSettlementSection({
  settlementSummary,
  displaySettlements,
  persistedSettlements,
  suggestedSettlements,
  totalActualSpent,
  avgActualSpentPerPerson,
  currentUserId,
  isLeader,
  isCancelled,
  actionLoading,
  onGenerateSettlements,
  onViewSettlementDetail,
  onOpenProof,
  onOpenConfirm,
  onOpenReject,
}: GroupSettlementSectionProps) {
  return (
    <div className="space-y-5">
      {/* Member Net Balances List */}
      {settlementSummary?.memberBalances && settlementSummary.memberBalances.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Bảng Số Dư Công Nợ Thành Viên ({settlementSummary.memberBalances.length} người)
            </h4>
            <span className="text-[11px] text-muted-foreground italic">
              Số dư = Đã ứng trước - Phần phải chịu
            </span>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-background overflow-hidden">
            {settlementSummary.memberBalances.map((mb) => {
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
                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                    <div className="text-right">
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

                    <div className="min-w-[100px] text-center">
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
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 space-y-4">
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
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Hạn thanh toán: Sau khi kết thúc chuyến đi
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!persistedSt ? (
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Đề xuất (chưa chốt)
                        </span>
                      ) : (
                        <>
                          {persistedSt.status === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              <Clock className="h-3 w-3" /> Chờ chuyển tiền
                            </span>
                          )}
                          {persistedSt.status === 'PROOF_SUBMITTED' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              <Send className="h-3 w-3" /> Đã gửi UNC (Chờ duyệt)
                            </span>
                          )}
                          {persistedSt.status === 'CONFIRMED' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" /> Đã quyết toán xong
                            </span>
                          )}
                          {persistedSt.status === 'REJECTED' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              <XCircle className="h-3 w-3" /> UNC bị từ chối
                            </span>
                          )}

                          {/* Quick Actions */}
                          {persistedSt.proofUrl && (
                            <button
                              type="button"
                              onClick={() => onViewSettlementDetail(persistedSt)}
                              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Xem chi tiết & UNC"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}

                          {isDebtor &&
                            (persistedSt.status === 'PENDING' ||
                              persistedSt.status === 'REJECTED') && (
                              <button
                                type="button"
                                onClick={() => onOpenProof(persistedSt)}
                                className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs cursor-pointer"
                              >
                                <Upload className="h-3 w-3" /> Gửi minh chứng
                              </button>
                            )}

                          {(isPayee || isLeader) && persistedSt.status === 'PROOF_SUBMITTED' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onOpenConfirm(persistedSt)}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition cursor-pointer"
                              >
                                Xác nhận đã nhận
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenReject(persistedSt)}
                                className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-500/20 transition border border-rose-500/20 cursor-pointer"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </>
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
