import type { ReactNode } from 'react';
import type { MomentItem } from '../types';
import { MomentPostCard, type MomentPostCardProps } from './MomentPostCard';
import { MomentsLoading } from './MomentsLoading';

interface MomentTimelineProps {
  moments: MomentItem[];
  isLoading: boolean;
  /** Khối hiển thị khi chưa có bài nào. */
  empty: ReactNode;
  /** Các prop dùng chung cho mọi thẻ bài viết trong dòng thời gian. */
  cardProps: Omit<MomentPostCardProps, 'moment'>;
}

/** Dòng thời gian khoảnh khắc dạng bảng tin. */
export function MomentTimeline({ moments, isLoading, empty, cardProps }: MomentTimelineProps) {
  if (isLoading) return <MomentsLoading />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {moments.length === 0
        ? empty
        : moments.map((moment) => (
            <MomentPostCard key={moment.momentId} moment={moment} {...cardProps} />
          ))}
    </div>
  );
}
