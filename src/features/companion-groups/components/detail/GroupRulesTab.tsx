import { AlertCircle, CheckCircle2, HeartHandshake, ShieldCheck, TreePine } from 'lucide-react';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';

interface GroupRulesTabProps {
  group: MatchingGroupDetailResponse;
}

export function GroupRulesTab({ group }: GroupRulesTabProps) {
  const deadlineText = group.matchingDeadline
    ? new Date(group.matchingDeadline).toLocaleDateString('vi-VN')
    : 'Trước ngày khởi hành';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-foreground">Cam kết & Quy tắc chuyến đi</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mọi thành viên tham gia cần đọc kỹ và tuân thủ các nguyên tắc sau để đảm bảo an toàn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: An toàn thể lực */}
          <div className="rounded-2xl border border-border bg-background p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>An toàn & Thể lực</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Thành viên tự chuẩn bị thể lực phù hợp với độ khó chuyến đi.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Không có tiền sử bệnh tim mạch hoặc hô hấp nặng chưa qua kiểm tra y tế.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Trang bị bảo hộ cá nhân (giày trek, áo ấm, đèn pin, thuốc y tế cơ bản).</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Bảo vệ thiên nhiên */}
          <div className="rounded-2xl border border-border bg-background p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <TreePine className="h-4 w-4" />
              <span>Leave No Trace</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Mang toàn bộ rác thải cá nhân ra khỏi rừng, không xả rác bừa bãi.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Không bẻ cây, săn bắt động vật hoặc làm tổn hại cảnh quan tự nhiên.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Tuân thủ quy định đốt lửa trại và bảo đảm an toàn phòng chống cháy rừng.
                </span>
              </li>
            </ul>
          </div>

          {/* Card 3: Tinh thần đồng đội */}
          <div className="rounded-2xl border border-border bg-background p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
              <HeartHandshake className="h-4 w-4" />
              <span>Tinh thần đồng đội</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Luôn đi cùng đoàn, không tự ý tách nhóm hoặc đi một mình vào rừng.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Lắng nghe chỉ dẫn của trưởng nhóm và hướng dẫn viên/porter địa phương.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Tương trợ giúp đỡ các thành viên khác khi gặp khó khăn trên cung đường.</span>
              </li>
            </ul>
          </div>

          {/* Card 4: Rút đơn & Hủy tham gia */}
          <div className="rounded-2xl border border-border bg-background p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Chính sách rút đơn</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Được tự do rút đơn trước hạn chót nhận đăng ký: {deadlineText}.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Nếu hủy sau khi chốt danh sách, thành viên cần trao đổi với Trưởng nhóm.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  Các chi phí cọc dịch vụ đã chi trả (vé tàu, permit...) không thể hoàn lại.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
