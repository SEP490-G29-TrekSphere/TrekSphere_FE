import { useEffect, useState } from 'react';

export function secondsUntil(deadline: string | undefined, now = Date.now()): number {
  if (!deadline) return 0;
  const deadlineTime = new Date(deadline).getTime();
  if (Number.isNaN(deadlineTime)) return 0;
  return Math.max(0, Math.floor((deadlineTime - now) / 1_000));
}

export function useBookingCountdown(deadline: string | undefined, isActive: boolean) {
  const [timeLeft, setTimeLeft] = useState<number>(() => (isActive ? secondsUntil(deadline) : 0));

  useEffect(() => {
    if (!isActive || !deadline) {
      setTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      setTimeLeft(secondsUntil(deadline));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, isActive]);

  return timeLeft;
}
