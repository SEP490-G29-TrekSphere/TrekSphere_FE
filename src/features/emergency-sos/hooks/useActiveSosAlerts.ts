import { useQuery } from '@tanstack/react-query';
import { sosService } from '../services/sosService';

export const sosAlertKeys = {
  all: ['sos-alerts'] as const,
  active: (page: number, size: number) => ['sos-alerts', 'active', page, size] as const,
};

export function useActiveSosAlerts(page: number, size: number) {
  return useQuery({
    queryKey: sosAlertKeys.active(page, size),
    queryFn: () => sosService.getActiveAlerts(page, size),
    refetchInterval: 20000,
  });
}
