import type { ReactNode } from 'react';
import type { MomentItem } from '../types';
import { MomentPostCard, type MomentPostCardProps } from './MomentPostCard';
import { MomentsLoading } from './MomentsLoading';

interface MomentTimelineProps {
  moments: MomentItem[];
  isLoading: boolean;

  empty: ReactNode;

  cardProps: Omit<MomentPostCardProps, 'moment'>;
}

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
