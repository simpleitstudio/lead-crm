export enum LeadStatus {
  NEW = 'NEW',
  ASSIGNED = 'ASSIGNED',
  CONTACTED = 'CONTACTED',
  INTERESTED = 'INTERESTED',
  FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED',
  MEETING_SCHEDULED = 'MEETING_SCHEDULED',
  DEMO_SCHEDULED = 'DEMO_SCHEDULED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  WON = 'WON',
  LOST = 'LOST',
  INVALID = 'INVALID',
}

export const LeadStatusLabels: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: 'New',
  [LeadStatus.ASSIGNED]: 'Assigned',
  [LeadStatus.CONTACTED]: 'Contacted',
  [LeadStatus.INTERESTED]: 'Interested',
  [LeadStatus.FOLLOW_UP_REQUIRED]: 'Follow-up Required',
  [LeadStatus.MEETING_SCHEDULED]: 'Meeting Scheduled',
  [LeadStatus.DEMO_SCHEDULED]: 'Demo Scheduled',
  [LeadStatus.PROPOSAL_SENT]: 'Proposal Sent',
  [LeadStatus.NEGOTIATION]: 'Negotiation',
  [LeadStatus.WON]: 'Won',
  [LeadStatus.LOST]: 'Lost',
  [LeadStatus.INVALID]: 'Invalid',
};

export const LeadStatusColors: Record<LeadStatus, string> = {
  [LeadStatus.NEW]: '#6366f1',
  [LeadStatus.ASSIGNED]: '#8b5cf6',
  [LeadStatus.CONTACTED]: '#3b82f6',
  [LeadStatus.INTERESTED]: '#06b6d4',
  [LeadStatus.FOLLOW_UP_REQUIRED]: '#f59e0b',
  [LeadStatus.MEETING_SCHEDULED]: '#10b981',
  [LeadStatus.DEMO_SCHEDULED]: '#14b8a6',
  [LeadStatus.PROPOSAL_SENT]: '#8b5cf6',
  [LeadStatus.NEGOTIATION]: '#f97316',
  [LeadStatus.WON]: '#22c55e',
  [LeadStatus.LOST]: '#ef4444',
  [LeadStatus.INVALID]: '#6b7280',
};

/**
 * Valid status transitions. ADMIN can override with any transition.
 * Non-admin users must follow this transition graph.
 */
export const LEAD_STATUS_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  [LeadStatus.NEW]: [LeadStatus.ASSIGNED, LeadStatus.INVALID],
  [LeadStatus.ASSIGNED]: [LeadStatus.CONTACTED, LeadStatus.LOST, LeadStatus.INVALID],
  [LeadStatus.CONTACTED]: [
    LeadStatus.INTERESTED,
    LeadStatus.FOLLOW_UP_REQUIRED,
    LeadStatus.LOST,
    LeadStatus.INVALID,
  ],
  [LeadStatus.INTERESTED]: [
    LeadStatus.FOLLOW_UP_REQUIRED,
    LeadStatus.MEETING_SCHEDULED,
    LeadStatus.DEMO_SCHEDULED,
    LeadStatus.PROPOSAL_SENT,
    LeadStatus.LOST,
  ],
  [LeadStatus.FOLLOW_UP_REQUIRED]: [
    LeadStatus.CONTACTED,
    LeadStatus.INTERESTED,
    LeadStatus.MEETING_SCHEDULED,
    LeadStatus.LOST,
    LeadStatus.INVALID,
  ],
  [LeadStatus.MEETING_SCHEDULED]: [
    LeadStatus.DEMO_SCHEDULED,
    LeadStatus.PROPOSAL_SENT,
    LeadStatus.FOLLOW_UP_REQUIRED,
    LeadStatus.LOST,
  ],
  [LeadStatus.DEMO_SCHEDULED]: [
    LeadStatus.PROPOSAL_SENT,
    LeadStatus.FOLLOW_UP_REQUIRED,
    LeadStatus.LOST,
  ],
  [LeadStatus.PROPOSAL_SENT]: [
    LeadStatus.NEGOTIATION,
    LeadStatus.FOLLOW_UP_REQUIRED,
    LeadStatus.WON,
    LeadStatus.LOST,
  ],
  [LeadStatus.NEGOTIATION]: [
    LeadStatus.PROPOSAL_SENT,
    LeadStatus.WON,
    LeadStatus.LOST,
  ],
  [LeadStatus.WON]: [],
  [LeadStatus.LOST]: [LeadStatus.FOLLOW_UP_REQUIRED],
  [LeadStatus.INVALID]: [],
};
