export enum NotificationPriority {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  URGENT = 'URGENT',
}

export const NotificationPriorityLabels: Record<NotificationPriority, string> = {
  [NotificationPriority.INFO]: 'Info',
  [NotificationPriority.SUCCESS]: 'Success',
  [NotificationPriority.WARNING]: 'Warning',
  [NotificationPriority.URGENT]: 'Urgent',
};
