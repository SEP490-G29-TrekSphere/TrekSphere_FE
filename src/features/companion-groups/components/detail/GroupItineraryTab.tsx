import { Clock, MapPin, Route } from 'lucide-react';
import type { MatchingGroupDetailResponse } from '../../types/matchingGroup';

interface GroupItineraryTabProps {
  group: MatchingGroupDetailResponse;
}

export function GroupItineraryTab({ group }: GroupItineraryTabProps) {
  const checkpoints = group.checkpoints ?? [];
  const hasCheckpoints = checkpoints.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-foreground">Lộ trình chuyến đi</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {group.sourceType === 'TOUR' && group.tourName
              ? `Lộ trình theo tour: ${group.tourName}`
              : 'Chi tiết các điểm dừng chân và mốc thời gian của hành trình'}
          </p>
        </div>

        {hasCheckpoints ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
            {checkpoints.map((cp, idx) => (
              <div key={cp.customJourneyCheckpointId || `cp-${idx}`} className="relative group">
                {/* Node icon */}
                <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background text-[10px] font-black text-primary shadow-xs">
                  {cp.checkpointOrder || idx + 1}
                </div>

                <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2 hover:bg-muted/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {cp.dayNo && (
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          Ngày {cp.dayNo}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-foreground">{cp.title}</h4>
                    </div>

                    {(cp.plannedStartAt || cp.plannedEndAt) && (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span>
                          {[cp.plannedStartAt, cp.plannedEndAt].filter(Boolean).join(' - ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {cp.locationName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{cp.locationName}</span>
                    </div>
                  )}

                  {cp.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cp.description}
                    </p>
                  )}

                  {cp.imageUrl && (
                    <div className="pt-2">
                      <img
                        src={cp.imageUrl}
                        alt={cp.title}
                        className="h-40 w-full rounded-xl object-cover border border-border"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Route className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">
                {group.sourceType === 'TOUR'
                  ? 'Theo lịch trình Tour chuẩn'
                  : 'Chưa có mốc điểm dừng chi tiết'}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {group.sourceType === 'TOUR'
                  ? `Chuyến đi tuân thủ theo lịch trình và hướng dẫn viên của tour "${group.tourName || 'TrekSphere'}".`
                  : 'Trưởng nhóm chưa cập nhật các checkpoint cụ thể cho hành trình này.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
