export enum FollowUpStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const FollowUpStatusLabels: Record<FollowUpStatus, string> = {
  [FollowUpStatus.PENDING]: 'Pending',
  [FollowUpStatus.COMPLETED]: 'Completed',
  [FollowUpStatus.CANCELLED]: 'Cancelled',
};

export const FollowUpStatusColors: Record<FollowUpStatus, string> = {
  [FollowUpStatus.PENDING]: '#f59e0b',
  [FollowUpStatus.COMPLETED]: '#22c55e',
  [FollowUpStatus.CANCELLED]: '#6b7280',
};
