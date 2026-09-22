import { AlertTriangle, Mountain, ShieldCheck, Sparkles } from 'lucide-react';
import { HIKING_EXPERIENCE_LEVEL_META, HIKING_PREFERRED_DIFFICULTY_LABELS } from '@/constants';
import type { PublicHikingSummary } from '@/features/profile';

function ChipList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-foreground"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}

export function ApplicantHikingSummary({ summary }: { summary: PublicHikingSummary }) {
  const experience = summary.experienceLevel
    ? HIKING_EXPERIENCE_LEVEL_META[summary.experienceLevel]
    : null;
  const preferredAreas = summary.preferredAreas?.filter(Boolean) ?? [];
  const skills = summary.skills?.filter(Boolean) ?? [];

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Mountain className="h-3.5 w-3.5 text-primary" />
            Kinh nghiệm
          </span>
          {experience ? (
            <span
              className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${experience.className}`}
            >
              {experience.label}
            </span>
          ) : (
            <p className="text-muted-foreground">Chưa cập nhật</p>
          )}
        </div>

        <div className="space-y-1 rounded-xl border border-border bg-muted/30 p-3">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Độ khó ưa thích
          </span>
          <p className="font-bold text-foreground">
            {summary.preferredDifficulty
              ? HIKING_PREFERRED_DIFFICULTY_LABELS[summary.preferredDifficulty]
              : 'Chưa cập nhật'}
          </p>
        </div>
      </div>

      {typeof summary.trustScore === 'number' &&
        (summary.trustScore < 80 ? (
          <div className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                Điểm uy tín thấp
              </span>
              <span className="text-right">
                <span className="block text-sm font-bold text-amber-700 dark:text-amber-300">
                  {summary.trustScore}/100
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {summary.trustReviewCount ?? 0} lượt đánh giá
                </span>
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-200/90 leading-relaxed italic">
              Lưu ý: Ứng viên có điểm uy tín dưới mức tiêu chuẩn 80 điểm. Cân nhắc kỹ trước khi
              duyệt.
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              Điểm uy tín
            </span>
            <span className="text-right">
              <span className="block text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {summary.trustScore}/100
              </span>
              <span className="text-[11px] text-muted-foreground">
                {summary.trustReviewCount ?? 0} lượt đánh giá
              </span>
            </span>
          </div>
        ))}

      {preferredAreas.length > 0 && (
        <Section title="Khu vực ưa thích">
          <ChipList items={preferredAreas} />
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Kỹ năng">
          <ChipList items={skills} />
        </Section>
      )}

      {summary.bio && (
        <Section title="Giới thiệu">
          <p className="leading-relaxed text-muted-foreground whitespace-pre-line">{summary.bio}</p>
        </Section>
      )}
    </>
  );
}
