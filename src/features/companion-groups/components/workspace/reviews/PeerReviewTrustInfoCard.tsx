import { Lock, ShieldCheck, Sparkles, Star } from 'lucide-react';

const TRUST_RULES = [
  {
    icon: Lock,
    iconClass: 'bg-emerald-500/10 text-emerald-600',
    title: 'Ẩn danh 100%',
    description:
      'Người được chấm và các thành viên khác trong đoàn sẽ không bao giờ biết ai đã gửi đánh giá hay chấm bao nhiêu điểm.',
  },
  {
    icon: Star,
    iconClass: 'bg-amber-500/10 text-amber-500',
    title: 'Mặc định 100 điểm (5.0⭐)',
    description:
      'Mỗi thành viên khởi tạo với 100 điểm uy tín. Đánh giá 5 sao giữ nguyên 100 điểm, đánh giá thấp hơn sẽ điều chỉnh điểm trung bình.',
  },
  {
    icon: Sparkles,
    iconClass: 'bg-primary/10 text-primary',
    title: '3 tiêu chí minh bạch',
    description:
      'Chấm điểm dựa trên 3 trụ cột: Thể lực thực tế, Đúng giờ & Trách nhiệm, và Minh bạch tài chính.',
  },
];

/** Giải thích cơ chế ẩn danh và cách tính Điểm uy tín. */
export function PeerReviewTrustInfoCard() {
  return (
    <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center gap-2 border-border border-b pb-4">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h3 className="font-bold text-base text-foreground">
          Cơ chế bảo mật & Điểm uy tín (Trust Score)
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {TRUST_RULES.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.title}
              className="space-y-2 rounded-2xl border border-border/60 bg-muted/20 p-4"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${rule.iconClass}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-foreground text-xs">{rule.title}</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">{rule.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
