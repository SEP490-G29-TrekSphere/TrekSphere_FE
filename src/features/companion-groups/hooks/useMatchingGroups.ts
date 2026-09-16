import { keepPreviousData, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import {
  companionGroupService,
  type GetMatchingGroupsParams,
} from '../services/companionGroupService';
import { companionGroupKeys } from './companionGroupKeys';

export function useMatchingGroups(
  params: GetMatchingGroupsParams = {},
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof companionGroupService.getMatchingGroups>>,
      Error,
      Awaited<ReturnType<typeof companionGroupService.getMatchingGroups>>,
      ReturnType<typeof companionGroupKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: companionGroupKeys.list(params),
    queryFn: () => companionGroupService.getMatchingGroups(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2, // 2 minutes
    ...options,
  });
}
