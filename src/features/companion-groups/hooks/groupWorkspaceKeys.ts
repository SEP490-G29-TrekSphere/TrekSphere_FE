/**
 * Query key factory cho `groupWorkspaceService.ts` (Workspace nhóm).
 */
export const groupWorkspaceKeys = {
  all: ['group-workspace'] as const,

  // Phase 5 Keys
  journey: (groupId: string) => [...groupWorkspaceKeys.all, 'journey', groupId] as const,
  checkpoints: (groupId: string) => [...groupWorkspaceKeys.all, 'checkpoints', groupId] as const,
  activities: (groupId: string) => [...groupWorkspaceKeys.all, 'activities', groupId] as const,
  costSummary: (groupId: string) => [...groupWorkspaceKeys.all, 'cost-summary', groupId] as const,
  costItems: (groupId: string) => [...groupWorkspaceKeys.all, 'cost-items', groupId] as const,
  checklist: (groupId: string) => [...groupWorkspaceKeys.all, 'checklist', groupId] as const,
  posts: (groupId: string) => [...groupWorkspaceKeys.all, 'posts', groupId] as const,
  postDetail: (groupId: string, postId: string) =>
    [...groupWorkspaceKeys.all, 'post', groupId, postId] as const,

  // Phase 6 Keys (Expense & Shares)
  expenses: (groupId: string, page?: number, size?: number) =>
    [...groupWorkspaceKeys.all, 'expenses', groupId, { page, size }] as const,
  expenseSummary: (groupId: string) =>
    [...groupWorkspaceKeys.all, 'expense-summary', groupId] as const,
  expenseDetail: (groupId: string, expenseId: string) =>
    [...groupWorkspaceKeys.all, 'expense-detail', groupId, expenseId] as const,

  // Legacy & other tabs support
  lifecycle: (groupId: string) => [...groupWorkspaceKeys.all, 'lifecycle', groupId] as const,
  feed: (groupId: string) => [...groupWorkspaceKeys.all, 'feed', groupId] as const,
  itinerary: (groupId: string) => [...groupWorkspaceKeys.all, 'itinerary', groupId] as const,
  budget: (groupId: string) => [...groupWorkspaceKeys.all, 'budget', groupId] as const,
  equipment: (groupId: string) => [...groupWorkspaceKeys.all, 'equipment', groupId] as const,
  members: (groupId: string) => [...groupWorkspaceKeys.all, 'members', groupId] as const,
  peerReviews: (groupId: string) => [...groupWorkspaceKeys.all, 'peer-reviews', groupId] as const,
  succession: (groupId: string) => [...groupWorkspaceKeys.all, 'succession', groupId] as const,
  dissolve: (groupId: string) => [...groupWorkspaceKeys.all, 'dissolve', groupId] as const,
};
