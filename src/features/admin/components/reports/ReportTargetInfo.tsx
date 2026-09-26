import { AlertTriangle, Maximize2, Shield, UserX } from 'lucide-react';
import { useState } from 'react';
import { stripHtml } from '@/utils/sanitize';
import { ReportTargetPreviewModal } from './ReportTargetPreviewModal';

export interface ReportTargetInfoProps {
  reason: string;
  reporterAvatar?: string | null;
  reporterFullName: string;
  reporterEmail: string;
  createdAt: string;
  targetType: string;
  targetId: string;
  targetTitle: string | null;
  targetContent: string | null;
  targetAuthorAvatar?: string | null;
  targetAuthorFullName?: string | null;
  targetAuthorEmail?: string | null;
  targetAuthorStatus?: string | null;
  targetAuthorTrustScore?: number | null;
}

export function ReportTargetInfo({
  reason,
  reporterAvatar,
  reporterFullName,
  reporterEmail,
  createdAt,
  targetType,
  targetId,
  targetTitle,
  targetContent,
  targetAuthorAvatar,
  targetAuthorFullName,
  targetAuthorEmail,
  targetAuthorStatus,
  targetAuthorTrustScore,
}: ReportTargetInfoProps) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div className="bg-[#FAF9F5] border border-[#E5E4DE] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Report Reason Highlight Box */}
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex gap-4 items-start shadow-sm">
        <div className="size-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="size-6 text-red-600" />
        </div>
        <div>
          <h4 className="text-red-900 font-extrabold text-sm uppercase tracking-wider mb-1.5">
            Lý do báo cáo
          </h4>
          <p className="text-red-800 font-medium text-base leading-snug">{reason}</p>
        </div>
      </div>

      {/* Two Columns: Reporter vs Target Author */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-[#E5E4DE]">
        {/* Reporter Card */}
        <div className="bg-white/80 border border-[#E5E4DE] rounded-2xl p-4 space-y-3">
          <span className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-400 block">
            NGƯỜI GỬI BÁO CÁO
          </span>
          <div className="flex items-center gap-3">
            {reporterAvatar ? (
              <img
                src={reporterAvatar}
                alt={reporterFullName}
                className="size-10 rounded-full object-cover border border-[#E5E4DE]"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-base uppercase">
                {reporterFullName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-zinc-900 truncate">{reporterFullName}</h3>
              <p className="text-xs text-zinc-500 font-medium truncate">{reporterEmail}</p>
            </div>
          </div>
          <div className="text-[11px] text-zinc-400 font-medium pt-1">
            Gửi lúc:{' '}
            <span className="font-bold text-zinc-700">
              {new Date(createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Target Author Card */}
        <div className="bg-white/80 border border-[#E5E4DE] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-zinc-400 block">
              TÁC GIẢ BỊ BÁO CÁO
            </span>
            {targetAuthorStatus && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  targetAuthorStatus === 'LOCKED'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                {targetAuthorStatus === 'LOCKED' ? 'Đã khóa' : 'Hoạt động'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {targetAuthorAvatar ? (
              <img
                src={targetAuthorAvatar}
                alt={targetAuthorFullName || 'Tác giả'}
                className="size-10 rounded-full object-cover border border-[#E5E4DE]"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-900 font-bold text-base uppercase">
                {targetAuthorFullName?.charAt(0) || <UserX className="size-5" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-sm text-zinc-900 truncate">
                {targetAuthorFullName || 'Chưa xác định'}
              </h3>
              <p className="text-xs text-zinc-500 font-medium truncate">
                {targetAuthorEmail || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 text-[11px]">
            <Shield className="size-3.5 text-emerald-700" />
            <span className="text-zinc-500 font-medium">Điểm tín nhiệm hiện tại:</span>
            <span className="font-extrabold text-emerald-800">
              {targetAuthorTrustScore !== null && targetAuthorTrustScore !== undefined
                ? `${targetAuthorTrustScore}/100`
                : '100/100'}
            </span>
          </div>
        </div>
      </div>

      {/* Target Content Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold tracking-wider text-zinc-500 uppercase">
          NỘI DUNG BỊ BÁO CÁO ({targetType})
        </span>
      </div>

      {/* Target Content Body Box — plain-text preview only, no scroll; click to see full content in a modal. */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="w-full text-left bg-[#EAE8E2]/60 border border-[#DCD9CF] rounded-2xl p-6 space-y-3 cursor-pointer transition-colors hover:bg-[#EAE8E2]"
        title="Xem đầy đủ nội dung bị báo cáo"
      >
        <h2 className="text-xl font-bold text-zinc-900 leading-snug">
          {targetTitle || 'Bình luận / Đánh giá'}
        </h2>
        <div
          className="line-clamp-3 text-sm font-medium leading-relaxed text-zinc-700"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: stripHtml() already removes all tags (ALLOWED_TAGS: []); only decoded text/entities remain.
          dangerouslySetInnerHTML={{ __html: stripHtml(targetContent ?? '') }}
        />
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Maximize2 className="size-3.5" />
          Xem đầy đủ nội dung
        </div>
      </button>

      <ReportTargetPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetTitle={targetTitle}
        targetContent={targetContent}
      />
    </div>
  );
}
