import { Mail, MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiService } from '@/config/apiClient';
import { getRoleChatPath, getVendorPublicProfilePath } from '@/constants';
import type { ConversationResponse } from '@/features/chat/types/types';
import type { TourDetailFromApi } from '@/features/tours/types';
import { useAppStore } from '@/store/useAppStore';
import { toast } from '@/store/useToastStore';

interface TourVendorCardProps {
  tour: TourDetailFromApi;
}

export function TourVendorCard({ tour }: TourVendorCardProps) {
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const [isConnecting, setIsConnecting] = useState(false);

  async function handleChat() {
    if (!user) {
      toast.warning('Vui lòng đăng nhập để chat với nhà cung cấp.');
      return;
    }

    const targetRecipientId = tour.vendorManagerId || tour.creatorId;
    if (!targetRecipientId) {
      toast.error('Không tìm thấy thông tin tài khoản của nhà tổ chức.');
      return;
    }

    setIsConnecting(true);
    try {
      // Check if conversation exists instead of creating it immediately
      const response = await ApiService<ConversationResponse>('/chat/conversations/check', 'POST', {
        conversationType: 'DIRECT',
        participantIds: [targetRecipientId],
      });

      const tourLink = `${window.location.origin}/tours/${tour.tourId}`;
      const initialMessage = `Xin chào, tôi quan tâm đến tour "${tour.tourName}":\n${tourLink}`;
      const draftTour = {
        tourId: tour.tourId,
        tourName: tour.tourName,
        coverImageUrl: tour.coverImageUrl,
        location: tour.location,
        durationDays: tour.durationDays,
        price: tour.price,
      };

      if (response.data?.conversationId) {
        navigate(getRoleChatPath(user.roles), {
          state: {
            conversationId: response.data.conversationId,
            initialMessage,
            draftTour,
          },
        });
      } else {
        const vendorName = tour.vendorName || tour.creatorName || 'Nhà tổ chức';
        navigate(getRoleChatPath(user.roles), {
          state: {
            virtualConversation: {
              type: 'DIRECT',
              participantIds: [targetRecipientId],
              userName: vendorName,
              title: vendorName,
            },
            initialMessage,
            draftTour,
          },
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể kết nối đến cuộc trò chuyện');
    } finally {
      setIsConnecting(false);
    }
  }

  const vendorName = tour.vendorName || tour.creatorName || 'Nhà tổ chức';

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Nhà tổ chức
      </h2>

      <Link
        to={getVendorPublicProfilePath(tour.vendorId)}
        className="flex items-center gap-3 rounded-xl transition-colors hover:bg-muted/60"
      >
        {tour.vendorLogoUrl ? (
          <img
            src={tour.vendorLogoUrl}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-bold text-primary">
            {vendorName.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground hover:text-primary">
            {vendorName}
          </p>
          {tour.creatorName && tour.creatorName !== vendorName && (
            <p className="truncate text-xs text-muted-foreground">Phụ trách: {tour.creatorName}</p>
          )}
        </div>
      </Link>

      {(tour.vendorContactEmail || tour.vendorContactPhone) && (
        <ul className="flex flex-col gap-2 text-sm">
          {tour.vendorContactPhone && (
            <li>
              <a
                href={`tel:${tour.vendorContactPhone}`}
                className="flex items-center gap-2.5 text-foreground/80 transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                {tour.vendorContactPhone}
              </a>
            </li>
          )}
          {tour.vendorContactEmail && (
            <li>
              <a
                href={`mailto:${tour.vendorContactEmail}`}
                className="flex items-center gap-2.5 truncate text-foreground/80 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate">{tour.vendorContactEmail}</span>
              </a>
            </li>
          )}
        </ul>
      )}

      <button
        type="button"
        onClick={handleChat}
        disabled={isConnecting}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 disabled:opacity-60"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {isConnecting ? 'Đang kết nối…' : 'Nhắn cho nhà tổ chức'}
      </button>
    </div>
  );
}
