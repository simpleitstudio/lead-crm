export enum LeadPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const LeadPriorityLabels: Record<LeadPriority, string> = {
  [LeadPriority.LOW]: 'Low',
  [LeadPriority.MEDIUM]: 'Medium',
  [LeadPriority.HIGH]: 'High',
  [LeadPriority.URGENT]: 'Urgent',
};

export const LeadPriorityColors: Record<LeadPriority, string> = {
  [LeadPriority.LOW]: '#6b7280',
  [LeadPriority.MEDIUM]: '#3b82f6',
  [LeadPriority.HIGH]: '#f59e0b',
  [LeadPriority.URGENT]: '#ef4444',
};

export const LeadPriorityOrder: Record<LeadPriority, number> = {
  [LeadPriority.LOW]: 0,
  [LeadPriority.MEDIUM]: 1,
  [LeadPriority.HIGH]: 2,
  [LeadPriority.URGENT]: 3,
};
