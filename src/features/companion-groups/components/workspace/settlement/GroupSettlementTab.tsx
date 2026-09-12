import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  Scale,
  Send,
  Sparkles,
  Upload,
  Wallet,
  XCircle,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useGroupSettlement } from '../../../hooks/useGroupSettlement';
import type { MatchingGroupDetailResponse } from '../../../types/matchingGroup';
import type { GroupSettlementResponse } from '../../../types/settlement';
import { MemberAvatar } from '../../detail/MemberAvatar';
import { ConfirmSettlementModal } from './ConfirmSettlementModal';
import { RejectSettlementModal } from './RejectSettlementModal';
import { SubmitProofModal } from './SubmitProofModal';

interface GroupSettlementTabProps {
  group: MatchingGroupDetailResponse;
  isLeader: boolean;
  currentUserId?: string;
}

export const GroupSettlementTab: React.FC<GroupSettlementTabProps> = ({
  group,
  isLeader,
  currentUserId,
}) => {
  const {
    summary,
    settlements,
    loading,
    actionLoading,
    refreshSettlementData,
    generateSettlements,
    submitProof,
    confirmPayment,
    rejectPayment,
  } = useGroupSettlement({ groupId: group.matchingGroupId });

  const [selectedSettlementForProof, setSelectedSettlementForProof] =
    useState<GroupSettlementResponse | null>(null);
  const [selectedSettlementForConfirm, setSelectedSettlementForConfirm] =
    useState<GroupSettlementResponse | null>(null);
  const [selectedSettlementForReject, setSelectedSettlementForReject] =
    useState<GroupSettlementResponse | null>(null);

  if (loading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-medium">Đang tính toán số dư công nợ...</p>
      </div>
    );
  }

  const memberBalances = summary?.memberBalances || [];
  const suggestions = summary?.suggestedSettlements || [];
  const activeSettlements = summary?.persistedSettlements || settlements;

  return (
    <div className="space-y-6">
      {/* 1. TOP SUMMARY CARD (MATCHING BUDGET TAB MOCKUP DESIGN) */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" /> Quyết toán & Tối giản công nợ
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tính toán số dư bù trừ thông minh và quản lý thanh toán giữa các thành viên
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-left sm:text-right">
              <span className="text-xs text-muted-foreground">Còn chờ thanh toán</span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {(summary?.totalPendingAmount ?? 0).toLocaleString('vi-VN')} đ
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-border pl-4">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSettlementData}
                disabled={actionLoading}
                className="text-xs font-bold gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>

              {isLeader && (
                <Button
                  size="sm"
                  onClick={generateSettlements}
                  disabled={actionLoading || suggestions.length === 0}
                  className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs cursor-pointer hover:bg-primary/90"
                >
                  {actionLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {activeSettlements.length > 0 ? 'Cập nhật quyết toán' : 'Tạo lệnh quyết toán'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 2. STAT MINI GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Tổng chi tiêu thực tế</span>
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-base font-extrabold text-foreground">
              {(summary?.totalGroupExpense ?? 0).toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Đã quyết toán xong</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {(summary?.totalSettledAmount ?? 0).toLocaleString('vi-VN')} đ
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-3.5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
              <span>Số lệnh quyết toán</span>
              <Scale className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="text-base font-extrabold text-foreground">
              {activeSettlements.length > 0
                ? `${activeSettlements.length} lệnh`
                : `${suggestions.length} đề xuất`}
            </div>
          </div>
        </div>

        {/* 3. MEMBER NET BALANCES LIST (MATCHING MOCKUP LIST DESIGN) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calculator className="h-3.5 w-3.5" />
              Bảng số dư ròng thành viên ({memberBalances.length} thành viên)
            </h4>
            <span className="text-[11px] text-muted-foreground italic">
              Số dư = Đã ứng trước - Phần phải chịu
            </span>
          </div>

          {memberBalances.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2">
              <p className="text-xs font-semibold text-foreground">
                Chưa có phát sinh chi tiêu nào trong nhóm
              </p>
              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Khi các thành viên thêm khoản chi tại tab "Chi tiêu thực tế", hệ thống sẽ tự động
                tính toán số dư bù trừ tại đây.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border bg-background overflow-hidden">
              {memberBalances.map((mb) => {
                const isCurrentUser = mb.member.userId === currentUserId;
                const isCreditor = mb.balanceType === 'CREDITOR';
                const isDebtor = mb.balanceType === 'DEBTOR';

                return (
                  <div
                    key={mb.member.matchingMemberId}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs hover:bg-muted/30 transition-colors ${
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
                              {mb.totalPaid.toLocaleString('vi-VN')} đ
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Phần phải chịu:{' '}
                            <strong className="text-foreground font-semibold">
                              {mb.totalShare.toLocaleString('vi-VN')} đ
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
                          className={`text-base font-black ${
                            isCreditor
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : isDebtor
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-muted-foreground'
                          }`}
                        >
                          {mb.netBalance > 0.01
                            ? `+${mb.netBalance.toLocaleString('vi-VN')} đ`
                            : mb.netBalance < -0.01
                              ? `${mb.netBalance.toLocaleString('vi-VN')} đ`
                              : '0 đ'}
                        </div>
                      </div>

                      <div className="min-w-[100px] text-center">
                        {isCreditor ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Được nhận lại
                          </span>
                        ) : isDebtor ? (
                          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Cần thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] font-bold text-muted-foreground border border-border">
                            Đã cân bằng
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. GREEDY NETTING SUGGESTIONS CARD */}
        {suggestions.length > 0 && activeSettlements.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Phương án chuyển tiền tối giản (Greedy Netting)
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Tối ưu chỉ {suggestions.length} giao dịch
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {suggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3 shadow-xs text-xs"
                >
                  <div className="flex items-center gap-2">
                    <MemberAvatar
                      fullName={s.fromMember.fullName}
                      avatarUrl={s.fromMember.avatarUrl ?? undefined}
                      size="sm"
                    />
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {s.fromMember.fullName}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-2">
                    <span className="text-[11px] font-black text-primary">
                      {s.amount.toLocaleString('vi-VN')} đ
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {s.toMember.fullName}
                    </span>
                    <MemberAvatar
                      fullName={s.toMember.fullName}
                      avatarUrl={s.toMember.avatarUrl ?? undefined}
                      size="sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {isLeader && (
              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  onClick={generateSettlements}
                  disabled={actionLoading}
                  className="text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Xác nhận và Khởi tạo các lệnh quyết toán này
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 5. ACTIVE SETTLEMENT WORKFLOW LIST */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              Tiến độ lệnh quyết toán & Chứng từ ({activeSettlements.length})
            </h4>
            <span className="text-[11px] text-muted-foreground">
              Người nợ nộp bill $\rightarrow$ Người nhận xác nhận
            </span>
          </div>

          {activeSettlements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center space-y-2">
              <Info className="h-6 w-6 mx-auto text-muted-foreground/60" />
              <p className="text-xs font-semibold text-foreground">
                Chưa có lệnh quyết toán nào được khởi tạo
              </p>
              {isLeader && suggestions.length > 0 && (
                <p className="text-xs text-primary font-medium">
                  Hãy nhấn nút "Tạo lệnh quyết toán" ở góc trên để chính thức gửi thông báo thanh
                  toán cho các thành viên.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {activeSettlements.map((st) => {
                const isDebtor = st.fromMember.userId === currentUserId;
                const isPayee = st.toMember.userId === currentUserId;

                return (
                  <div
                    key={st.groupSettlementId}
                    className="rounded-2xl border border-border bg-background p-4 space-y-3 hover:border-primary/40 transition-colors shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Parties info */}
                      <div className="flex items-center gap-3">
                        {/* From Member */}
                        <div className="flex items-center gap-2">
                          <MemberAvatar
                            fullName={st.fromMember.fullName}
                            avatarUrl={st.fromMember.avatarUrl ?? undefined}
                            size="sm"
                          />
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {st.fromMember.fullName}
                            </p>
                            <span className="text-[10px] text-rose-500 font-semibold">
                              Người nợ (Chuyển tiền)
                            </span>
                          </div>
                        </div>

                        {/* Arrow & Amount */}
                        <div className="flex flex-col items-center px-3">
                          <span className="text-xs font-black text-primary">
                            {st.amount.toLocaleString('vi-VN')} đ
                          </span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* To Member */}
                        <div className="flex items-center gap-2">
                          <MemberAvatar
                            fullName={st.toMember.fullName}
                            avatarUrl={st.toMember.avatarUrl ?? undefined}
                            size="sm"
                          />
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              {st.toMember.fullName}
                            </p>
                            <span className="text-[10px] text-emerald-500 font-semibold">
                              Người nhận
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {st.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Clock className="h-3 w-3" /> Chờ chuyển tiền
                          </span>
                        )}
                        {st.status === 'PROOF_SUBMITTED' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Send className="h-3 w-3" /> Đã gửi chứng từ
                          </span>
                        )}
                        {st.status === 'CONFIRMED' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3" /> Đã hoàn tất
                          </span>
                        )}
                        {st.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="h-3 w-3" /> Bị từ chối
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rejection Alert Banner */}
                    {st.status === 'REJECTED' && st.rejectReason && (
                      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Lý do từ chối: </span>
                          <span>{st.rejectReason}</span>
                        </div>
                      </div>
                    )}

                    {/* Proof details if submitted */}
                    {st.proofUrl && (
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                        <a
                          href={st.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-primary hover:bg-muted transition-colors font-bold"
                        >
                          <ExternalLink className="h-3 w-3" /> Xem ảnh bill chuyển tiền
                        </a>
                        {st.paymentMethod && <span>Phương thức: {st.paymentMethod}</span>}
                        {st.note && <span>Ghi chú: "{st.note}"</span>}
                      </div>
                    )}

                    {/* Action Buttons for Debtor and Payee */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                      {/* Debtor actions */}
                      {isDebtor && (st.status === 'PENDING' || st.status === 'REJECTED') && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedSettlementForProof(st)}
                          className="text-xs font-bold gap-1.5 cursor-pointer"
                        >
                          <Upload className="h-3.5 w-3.5" /> Nộp chứng từ chuyển tiền
                        </Button>
                      )}

                      {/* Payee actions */}
                      {isPayee && st.status === 'PROOF_SUBMITTED' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSettlementForReject(st)}
                            className="text-xs font-bold text-destructive hover:bg-destructive/10 gap-1.5 cursor-pointer"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Từ chối
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setSelectedSettlementForConfirm(st)}
                            className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Xác nhận đã nhận tiền
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. INFO FOOTER */}
        <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3.5 text-xs text-muted-foreground">
          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Hệ thống áp dụng thuật toán <strong>Tối giản hóa công nợ (Greedy Netting)</strong> để
            giảm thiểu tối đa số lần chuyển khoản giữa các thành viên. Khi người nhận xác nhận tiền
            về, các khoản nợ tương ứng sẽ được tự động hoàn tất.
          </p>
        </div>
      </div>

      {/* MODALS */}
      <SubmitProofModal
        isOpen={Boolean(selectedSettlementForProof)}
        onClose={() => setSelectedSettlementForProof(null)}
        settlement={selectedSettlementForProof}
        onSubmit={submitProof}
        actionLoading={actionLoading}
      />

      <ConfirmSettlementModal
        isOpen={Boolean(selectedSettlementForConfirm)}
        onClose={() => setSelectedSettlementForConfirm(null)}
        settlement={selectedSettlementForConfirm}
        onConfirm={confirmPayment}
        actionLoading={actionLoading}
      />

      <RejectSettlementModal
        isOpen={Boolean(selectedSettlementForReject)}
        onClose={() => setSelectedSettlementForReject(null)}
        settlement={selectedSettlementForReject}
        onReject={rejectPayment}
        actionLoading={actionLoading}
      />
    </div>
  );
};
