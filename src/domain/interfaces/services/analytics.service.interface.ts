import { UserRole } from '../../enums';

export interface IDashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  overdueFollowUps: number;
  statusDistribution: Record<string, number>;
  sourceDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  monthlyTrends: Array<{ month: string; created: number; won: number; lost: number }>;
}

export interface ISalesPerformance {
  userId: string;
  userName: string;
  role: string;
  leadsAssigned: number;
  leadsWon: number;
  leadsLost: number;
  conversionRate: number;
  revenueGenerated?: number;
}

export interface IAnalyticsService {
  getDashboardStats(performerId: string, performerRole: UserRole): Promise<IDashboardStats>;
  getSalesPerformance(startDate: Date, endDate: Date, performerId: string, performerRole: UserRole): Promise<ISalesPerformance[]>;
}
