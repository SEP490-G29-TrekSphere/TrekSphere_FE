import {
  CheckCircle2,
  Clock,
  Info,
  Layers,
  Loader2,
  MapPin,
  Route,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useTourCheckpoints } from '@/features/tours/hooks/useTourCheckpoints';
import { useTourDetail } from '@/features/tours/hooks/useTourDetail';
import { AppButton, AppModalShell } from '@/shared/ui';

const TOUR_PREVIEW_TABS = [
  { id: 'itinerary', label: 'Lộ trình Checkpoints', icon: Route },
  { id: 'overview', label: 'Mô tả & Điểm nhấn', icon: Layers },
  { id: 'services', label: 'Dịch vụ bao gồm', icon: ShieldCheck },
] as const;

type TourPreviewSection = (typeof TOUR_PREVIEW_TABS)[number]['id'];

interface TourPreviewDetailModalProps {
  isOpen: boolean;
  tourId: string | null;
  onClose: () => void;
}

export function TourPreviewDetailModal({ isOpen, tourId, onClose }: TourPreviewDetailModalProps) {
  const [activeSection, setActiveSection] = useState<TourPreviewSection>('itinerary');

  const { data: tour, isLoading: isTourLoading } = useTourDetail(tourId || undefined);
  const { data: checkpoints = [], isLoading: isCheckpointsLoading } = useTourCheckpoints(
    tourId || undefined
  );

  if (!isOpen || !tourId) return null;

  const isLoading = isTourLoading || isCheckpointsLoading;

  return (
    <AppModalShell
      open={isOpen}
      onClose={onClose}
      aria-label="Xem chi tiết lộ trình Tour"
      className="z-60 flex max-h-[88vh] max-w-3xl flex-col overflow-hidden border border-border p-0"
    >
      {/* Top Banner Header */}
      <div className="relative border-b border-border bg-muted/40">
        {tour?.coverImageUrl ? (
          <div className="relative h-44 w-full overflow-hidden sm:h-52">
            <img
              src={tour.coverImageUrl}
              alt={tour.tourName}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/90 px-2 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                  Tour đối tác
                </span>
                {tour.location && (
                  <span className="flex items-center gap-1 rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                    <MapPin className="h-3 w-3 text-emerald-400" />
                    {tour.location}
                  </span>
                )}
                {tour.difficulty && (
                  <span className="rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                    {tour.difficulty}
                  </span>
                )}
              </div>
              <h2 className="mt-1.5 font-bold text-lg text-white sm:text-xl line-clamp-1">
                {tour.tourName}
              </h2>
              {tour.vendorName && (
                <p className="text-white/80 text-xs mt-0.5">
                  Đơn vị tổ chức:{' '}
                  <span className="font-semibold text-white">{tour.vendorName}</span>
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                Tour đối tác
              </span>
              {tour?.location && (
                <span className="text-muted-foreground text-xs flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {tour.location}
                </span>
              )}
            </div>
            <h2 className="mt-2 font-bold text-foreground text-xl">
              {tour?.tourName || 'Đang tải thông tin tour...'}
            </h2>
          </div>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 backdrop-blur-xs"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Stats Grid */}
      {tour && (
        <div className="grid grid-cols-2 gap-2 border-b border-border bg-card px-6 py-3 sm:grid-cols-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            <div>
              <p className="text-muted-foreground text-[10px]">Thời lượng</p>
              <p className="font-bold text-foreground">{tour.durationDays || 1} ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[10px]">Sức chứa</p>
              <p className="font-bold text-foreground">
                {tour.minCapacity || 1} - {tour.maxCapacity || 20} người
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-amber-500 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[10px]">Quãng đường</p>
              <p className="font-bold text-foreground">
                {tour.totalDistanceKm ? `${tour.totalDistanceKm} km` : 'Tiêu chuẩn'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-muted-foreground text-[10px]">Giá tham khảo</p>
              <p className="font-bold text-primary">
                {tour.basePrice ? `${tour.basePrice.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-border bg-muted/20 px-6">
        {TOUR_PREVIEW_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          const countBadge = tab.id === 'itinerary' ? ` (${checkpoints.length})` : '';
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-bold transition-colors cursor-pointer ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {countBadge}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-xs font-medium">Đang tải thông tin chi tiết của tour...</p>
          </div>
        ) : (
          <>
            {/* Tab 1: Checkpoints Timeline */}
            {activeSection === 'itinerary' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <p>
                    Khi bạn tạo nhóm theo tour này, toàn bộ{' '}
                    <strong className="text-foreground">{checkpoints.length} điểm dừng chân</strong>{' '}
                    bên dưới sẽ được <strong>tự động nhân bản</strong> vào Workspace của nhóm để bạn
                    và thành viên theo dõi cũng như tùy biến thêm.
                  </p>
                </div>

                {checkpoints.length > 0 ? (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                    {checkpoints.map((cp, idx) => (
                      <div key={cp.checkpointId || `cp-${idx}`} className="relative group">
                        <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background text-[10px] font-black text-primary shadow-xs">
                          {cp.checkpointOrder || idx + 1}
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4 space-y-2 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-foreground">
                              {cp.checkpointName}
                            </h4>
                            {cp.altitude && (
                              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Cao độ: {cp.altitude}m
                              </span>
                            )}
                          </div>

                          {cp.description && (
                            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                              {cp.description}
                            </p>
                          )}

                          {cp.checkpointImageUrl && (
                            <div className="pt-2">
                              <img
                                src={cp.checkpointImageUrl}
                                alt={cp.checkpointName}
                                className="h-36 w-full rounded-lg object-cover border border-border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-2">
                    <Route className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-xs font-semibold text-foreground">
                      Lộ trình tuân thủ theo lịch trình tiêu chuẩn của Tour
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Nhà tổ chức chưa cấu hình mốc checkpoints riêng lẻ, chuyến đi sẽ thực hiện
                      theo hướng dẫn viên và lịch trình chính.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Overview & Highlights */}
            {activeSection === 'overview' && tour && (
              <div className="space-y-4">
                {tour.highlights && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Điểm nổi bật của Tour
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {tour.highlights}
                    </p>
                  </div>
                )}

                {tour.description && (
                  <div className="rounded-xl border border-border bg-card p-4 space-y-2">
                    <h3 className="font-bold text-foreground text-sm">Mô tả hành trình</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                      {tour.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Services Included / Excluded */}
            {activeSection === 'services' && tour && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <h3 className="font-bold text-emerald-700 text-sm flex items-center gap-1.5 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Dịch vụ bao gồm
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tour.includes || 'Tuân thủ theo chính sách tiêu chuẩn của nhà cung cấp tour.'}
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-2">
                  <h3 className="font-bold text-rose-700 text-sm flex items-center gap-1.5 dark:text-rose-400">
                    <XCircle className="h-4 w-4" />
                    Không bao gồm
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {tour.excludes || 'Các chi phí mua sắm và đồ dùng cá nhân tự túc.'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Actions Footer */}
      <div className="flex items-center justify-end border-t border-border bg-muted/30 px-6 py-3.5">
        <AppButton variant="outline" size="sm" onClick={onClose}>
          Đóng
        </AppButton>
      </div>
    </AppModalShell>
  );
}
