import { IAnalyticsService, IDashboardStats, ISalesPerformance } from '../../domain/interfaces/services/analytics.service.interface';
import { ILeadRepository } from '../../domain/interfaces/repositories/lead.repository.interface';
import { IFollowUpRepository } from '../../domain/interfaces/repositories/follow-up.repository.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { UserRole } from '../../domain/enums/user-role.enum';
import { LeadStatus } from '../../domain/enums/lead-status.enum';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly followUpRepository: IFollowUpRepository,
    private readonly userRepository: IUserRepository
  ) {}

  public async getDashboardStats(performerId: string, performerRole: UserRole): Promise<IDashboardStats> {
    const isSalesOrLeadGen = performerRole !== UserRole.ADMIN;
    
    // Scoped queries or general queries based on role
    const scopeFilters: any = {};
    if (isSalesOrLeadGen) {
      if (performerRole === UserRole.SALES) {
        scopeFilters.assignedToId = performerId;
      } else if (performerRole === UserRole.LEAD_GENERATOR) {
        scopeFilters.createdById = performerId;
      }
    }

    const totalLeads = await this.leadRepository.count(scopeFilters);
    const newLeads = await this.leadRepository.count({ ...scopeFilters, status: LeadStatus.NEW });
    const contactedLeads = await this.leadRepository.count({ ...scopeFilters, status: LeadStatus.CONTACTED });
    const interestedLeads = await this.leadRepository.count({ ...scopeFilters, status: LeadStatus.INTERESTED });
    const wonLeads = await this.leadRepository.count({ ...scopeFilters, status: LeadStatus.WON });
    const lostLeads = await this.leadRepository.count({ ...scopeFilters, status: LeadStatus.LOST });
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const overdueFollowUps = await this.followUpRepository.countOverdue(isSalesOrLeadGen ? performerId : undefined);

    const statusDistribution = await this.leadRepository.countByStatus();
    const sourceDistribution = await this.leadRepository.countBySource();
    const priorityDistribution = await this.leadRepository.countByPriority();

    // Setup 6 months trend data
    const monthlyTrends: any[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const created = await this.leadRepository.countCreatedInRange(startOfMonth, endOfMonth);
      const won = await this.leadRepository.countWonInRange(startOfMonth, endOfMonth);
      const lost = await this.leadRepository.countLostInRange(startOfMonth, endOfMonth);

      monthlyTrends.push({
        month: targetMonth.toLocaleString('default', { month: 'short' }),
        created,
        won,
        lost,
      });
    }

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      interestedLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      overdueFollowUps,
      statusDistribution,
      sourceDistribution,
      priorityDistribution,
      monthlyTrends,
    };
  }

  public async getSalesPerformance(startDate: Date, endDate: Date, performerId: string, performerRole: UserRole): Promise<ISalesPerformance[]> {
    if (performerRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can view overall sales performance');
    }

    const salesUsers = await this.userRepository.findByRole(UserRole.SALES);
    const performances: ISalesPerformance[] = [];

    for (const sales of salesUsers) {
      const assignedCount = await this.leadRepository.count({
        assignedToId: sales.id,
        dateFrom: startDate,
        dateTo: endDate,
      });
      const wonCount = await this.leadRepository.count({
        assignedToId: sales.id,
        status: LeadStatus.WON,
        dateFrom: startDate,
        dateTo: endDate,
      });
      const lostCount = await this.leadRepository.count({
        assignedToId: sales.id,
        status: LeadStatus.LOST,
        dateFrom: startDate,
        dateTo: endDate,
      });

      const conversionRate = assignedCount > 0 ? Math.round((wonCount / assignedCount) * 100) : 0;

      performances.push({
        userId: sales.id,
        userName: sales.fullName,
        role: sales.role,
        leadsAssigned: assignedCount,
        leadsWon: wonCount,
        leadsLost: lostCount,
        conversionRate,
      });
    }

    return performances;
  }
}
