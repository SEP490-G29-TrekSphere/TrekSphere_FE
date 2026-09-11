import { Clock, Layers, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { TIMETABLE_TIME_SLOTS } from '../../../constants/workspace';
import type { CustomJourneyActivityResponse, TimeSlot } from '../../../types/workspace';

interface ActivityTimetableSectionProps {
  activities: CustomJourneyActivityResponse[];
  days: number[];
  canEdit: boolean;
  onOpenAddActivity: (dayNo?: number, slot?: TimeSlot) => void;
  onEditActivity: (activity: CustomJourneyActivityResponse) => void;
  onDeleteActivity: (activity: CustomJourneyActivityResponse) => void;
}

export function ActivityTimetableSection({
  activities,
  days,
  canEdit,
  onOpenAddActivity,
  onEditActivity,
  onDeleteActivity,
}: ActivityTimetableSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="text-base font-extrabold text-foreground">
              Thời Khóa Biểu Lộ Trình ({activities.length} hoạt động)
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Phân bổ thời gian, điểm dừng & hoạt động theo từng buổi và từng ngày của chuyến đi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              type="button"
              onClick={() => onOpenAddActivity(1, 'MORNING')}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Thêm Hoạt Động
            </button>
          )}
        </div>
      </div>

      {activities.length === 0 && days.length === 0 ? (
        <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
          <p>Chưa có hoạt động chi tiết nào trong thời khóa biểu.</p>
          {canEdit && (
            <p className="text-[11px] text-primary font-medium">
              Bấm "Thêm Hoạt Động" để lên lịch các hoạt động cụ thể (ăn uống, trekking, cắm trại...)
              theo từng buổi và ngày.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-background">
          <table className="w-full min-w-[700px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="w-36 p-3 text-left font-extrabold text-foreground uppercase tracking-wider text-[11px] border-r border-border">
                  BUỔI / THỜI GIAN
                </th>
                {days.map((day) => {
                  const dayActivitiesCount = activities.filter((act) => act.dayNo === day).length;
                  return (
                    <th
                      key={day}
                      className="p-3 text-left border-r border-border last:border-r-0 min-w-[200px]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block font-black text-foreground text-xs">
                            Ngày {day}
                          </span>
                          <span className="text-[11px] font-normal text-muted-foreground">
                            {dayActivitiesCount} hoạt động
                          </span>
                        </div>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onOpenAddActivity(day, 'MORNING')}
                            className="rounded-full p-1 text-muted-foreground hover:text-primary hover:bg-muted/80 transition cursor-pointer"
                            title={`Thêm hoạt động vào Ngày ${day}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_TIME_SLOTS.map((slot) => (
                <tr key={slot.id} className="border-b border-border last:border-b-0 align-top">
                  {/* Cột Label buổi */}
                  <td className="p-3 border-r border-border bg-muted/20">
                    <div className="space-y-1">
                      <span className="inline-block rounded-md px-2 py-0.5 text-[10px] font-black border bg-muted text-foreground border-border">
                        {slot.label}
                      </span>
                      <span className="block text-[11px] font-mono text-muted-foreground">
                        {slot.time}
                      </span>
                    </div>
                  </td>

                  {/* Các cột Ngày */}
                  {days.map((day) => {
                    const slotActivities = activities.filter((act) => {
                      const actDay = act.dayNo ?? 1;
                      if (actDay !== day) return false;
                      return act.timeSlot === slot.slotEnum;
                    });

                    return (
                      <td
                        key={day}
                        className="p-2.5 border-r border-border last:border-r-0 space-y-2 bg-card/40 min-w-[200px]"
                      >
                        {slotActivities.length === 0 ? (
                          canEdit ? (
                            <button
                              type="button"
                              onClick={() => onOpenAddActivity(day, slot.slotEnum)}
                              className="h-16 w-full rounded-xl border border-dashed border-border/60 flex items-center justify-center text-[11px] text-muted-foreground/60 transition hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer"
                            >
                              + Thêm hoạt động
                            </button>
                          ) : (
                            <div className="h-16 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-[11px] text-muted-foreground/60">
                              Trống
                            </div>
                          )
                        ) : (
                          <>
                            {slotActivities.map((act) => {
                              const actId = act.customJourneyActivityId || act.id || '';
                              return (
                                <div
                                  key={actId}
                                  className="group relative rounded-xl border border-border bg-card p-3 shadow-xs hover:border-primary/50 transition-all space-y-1.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] font-bold text-primary flex items-center gap-1">
                                      <Clock className="h-3 w-3 shrink-0" />
                                      {[act.plannedStartAt, act.plannedEndAt]
                                        .filter(Boolean)
                                        .join(' - ') || slot.time}
                                    </span>
                                    {canEdit && (
                                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                                        <button
                                          type="button"
                                          onClick={() => onEditActivity(act)}
                                          className="text-muted-foreground hover:text-primary p-0.5 cursor-pointer"
                                          title="Sửa hoạt động"
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => onDeleteActivity(act)}
                                          className="text-muted-foreground hover:text-destructive p-0.5 cursor-pointer"
                                          title="Xóa hoạt động"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  <strong className="block text-xs font-bold text-foreground line-clamp-1">
                                    {act.title}
                                  </strong>

                                  {act.checkpointTitle && (
                                    <div className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10.5px] font-semibold text-primary">
                                      <MapPin className="h-3 w-3 shrink-0 text-red-500" />
                                      <span className="truncate max-w-[150px]">
                                        {act.checkpointTitle}
                                      </span>
                                    </div>
                                  )}

                                  {act.description && (
                                    <p className="text-[10.5px] text-muted-foreground/90 line-clamp-2">
                                      {act.description}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => onOpenAddActivity(day, slot.slotEnum)}
                                className="w-full py-1 rounded-lg border border-dashed border-border/60 hover:border-primary/40 hover:bg-primary/5 text-[10.5px] font-medium text-muted-foreground hover:text-primary transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                                Thêm
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
