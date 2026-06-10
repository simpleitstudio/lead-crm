import { NextResponse } from 'next/server';
import { container } from '../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../middleware/error-handler.middleware';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type') || 'dashboard';

    const analyticsService = container.getAnalyticsService();

    if (type === 'sales') {
      const dateFromStr = searchParams.get('dateFrom') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const dateToStr = searchParams.get('dateTo') || new Date().toISOString();
      const dateFrom = new Date(dateFromStr);
      const dateTo = new Date(dateToStr);

      const performance = await analyticsService.getSalesPerformance(
        dateFrom,
        dateTo,
        req.user.id,
        req.user.role
      );
      return NextResponse.json(performance);
    }

    const stats = await analyticsService.getDashboardStats(req.user.id, req.user.role);
    return NextResponse.json(stats);
  })
);
