import { NextResponse } from 'next/server';
import { container } from '../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../middleware/error-handler.middleware';
import { PaginationVo } from '../../../domain/value-objects/pagination.vo';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const pagination = new PaginationVo(page, limit);

    const activityService = container.getActivityService();
    const result = await activityService.getActivitiesByLead(
      leadId,
      pagination,
      req.user.id,
      req.user.role
    );

    return NextResponse.json(result);
  })
);
