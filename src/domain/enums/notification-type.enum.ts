export enum NotificationType {
  LEAD_ASSIGNED = 'LEAD_ASSIGNED',
  FOLLOWUP_DUE = 'FOLLOWUP_DUE',
  FOLLOWUP_OVERDUE = 'FOLLOWUP_OVERDUE',
  LEAD_REASSIGNED = 'LEAD_REASSIGNED',
}

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.LEAD_ASSIGNED]: 'Lead Assigned',
  [NotificationType.FOLLOWUP_DUE]: 'Follow-up Due',
  [NotificationType.FOLLOWUP_OVERDUE]: 'Follow-up Overdue',
  [NotificationType.LEAD_REASSIGNED]: 'Lead Reassigned',
};
