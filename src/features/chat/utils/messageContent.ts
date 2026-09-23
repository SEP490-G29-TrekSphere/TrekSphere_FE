import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { getSafeImageUrl } from '@/utils/sanitize';
import type { DetailMessage } from '../types/types';

const IMAGE_EXTENSION_PATTERN = /\.(?:png|jpe?g|gif|webp|avif|bmp|svg)(?:[?#]|$)/i;
const SINGLE_URL_PATTERN = /^https?:\/\/[^\s]+$/i;

export function getMessageImageUrl(content?: string): string | undefined {
  if (!content) return undefined;

  const trimmed = content.trim();
  if (!SINGLE_URL_PATTERN.test(trimmed)) return undefined;

  const isImage = IMAGE_EXTENSION_PATTERN.test(trimmed) || trimmed.includes('/image/upload/');
  if (!isImage) return undefined;

  return getSafeImageUrl(trimmed);
}

export function getConversationPreview(content?: string): string {
  if (!content) return '';
  if (getMessageImageUrl(content)) return '📷 Hình ảnh';
  return content.length > 60 ? `${content.slice(0, 60)}...` : content;
}

export function formatDayLabel(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  if (isToday(date)) return 'Hôm nay';
  if (isYesterday(date)) return 'Hôm qua';
  return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
}

export function formatMessageTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'HH:mm');
}

const GROUP_WINDOW_MS = 5 * 60 * 1000;

export interface MessageGroup {
  kind: 'group';
  id: string;
  senderId: string;
  senderName: string;
  avatarUrl?: string;
  isOwn: boolean;

  createdAt: string;
  messages: DetailMessage[];
}

export type TimelineItem =
  | MessageGroup
  | { kind: 'day'; id: string; label: string }
  | { kind: 'unread'; id: string };

export function buildTimeline(
  messages: DetailMessage[],
  unreadMarkerId?: string | null
): TimelineItem[] {
  const items: TimelineItem[] = [];
  let currentGroup: MessageGroup | null = null;
  let currentDayKey = '';

  for (const message of messages) {
    const date = new Date(message.createdAt);
    const dayKey = Number.isNaN(date.getTime()) ? '' : format(date, 'yyyy-MM-dd');

    if (dayKey && dayKey !== currentDayKey) {
      currentDayKey = dayKey;
      currentGroup = null;
      items.push({ kind: 'day', id: `day-${dayKey}`, label: formatDayLabel(message.createdAt) });
    }

    if (unreadMarkerId && message.id === unreadMarkerId) {
      currentGroup = null;
      items.push({ kind: 'unread', id: `unread-${message.id}` });
    }

    const previous = currentGroup?.messages.at(-1);
    const withinWindow =
      previous !== undefined &&
      Math.abs(new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime()) <
        GROUP_WINDOW_MS;

    if (currentGroup && currentGroup.senderId === message.senderId && withinWindow) {
      currentGroup.messages.push(message);
      continue;
    }

    currentGroup = {
      kind: 'group',
      id: `group-${message.id}`,
      senderId: message.senderId,
      senderName: message.senderName,
      avatarUrl: message.senderAvatarUrl,
      isOwn: message.isOwn,
      createdAt: message.createdAt,
      messages: [message],
    };
    items.push(currentGroup);
  }

  return items;
}

export function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(-2)
    .toUpperCase();
}
