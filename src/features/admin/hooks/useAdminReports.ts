import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminReportService,
  type ReportFilterRequest,
  type ReportResponse,
  type ResolveReportRequest,
} from '../services/adminReportService';

export const adminReportKeys = {
  all: ['admin', 'reports'] as const,
  lists: () => [...adminReportKeys.all, 'list'] as const,
  list: (filter: ReportFilterRequest) => [...adminReportKeys.lists(), { filter }] as const,
  details: () => [...adminReportKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminReportKeys.details(), id] as const,
};

export function useAdminReports(filter: ReportFilterRequest) {
  return useQuery({
    queryKey: adminReportKeys.list(filter),
    queryFn: () => adminReportService.getReports(filter),
    placeholderData: keepPreviousData,
  });
}

export function useAdminReportDetail(id?: string) {
  return useQuery({
    queryKey: adminReportKeys.detail(id || ''),
    queryFn: () => adminReportService.getReportDetail(id || ''),
    enabled: Boolean(id),
  });
}

export function useResolveAdminReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResolveReportRequest }) =>
      adminReportService.resolveReport(id, data),
    onSuccess: async (_, variables) => {
      queryClient.setQueryData(
        adminReportKeys.detail(variables.id),
        (old: ReportResponse | undefined) => {
          if (!old) return old;
          return {
            ...old,
            status: variables.data.action === 'DISMISS' ? 'DISMISSED' : 'RESOLVED',
            resolutionNotes: variables.data.resolutionNotes,
            updatedAt: new Date().toISOString(),
          };
        }
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminReportKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: adminReportKeys.detail(variables.id) }),
      ]);
    },
  });
}
