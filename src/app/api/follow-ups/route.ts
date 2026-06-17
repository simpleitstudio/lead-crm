import { NextResponse } from 'next/server';
import { container } from '../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../middleware/error-handler.middleware';
import { PaginationVo } from '../../../domain/value-objects/pagination.vo';
import { FollowUpStatus } from '../../../domain/enums/follow-up-status.enum';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    const leadId = searchParams.get('leadId');
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const pagination = new PaginationVo(page, limit);

    const followUpService = container.getFollowUpService();

    if (leadId) {
      const result = await followUpService.getFollowUpsByLead(leadId, pagination, req.user.id, req.user.role);
      return NextResponse.json(result);
    }

    const userId = searchParams.get('userId') || req.user.id;
    const status = (searchParams.get('status') as FollowUpStatus) || undefined;
    const result = await followUpService.getFollowUpsForUser(userId, status, pagination);

    return NextResponse.json(result);
  })
);

export const POST = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const body = await req.json();
    const { leadId, assignedToId, scheduledAt, note } = body;

    if (!leadId || !assignedToId || !scheduledAt) {
      return NextResponse.json({ error: 'leadId, assignedToId and scheduledAt are required' }, { status: 400 });
    }

    const followUpService = container.getFollowUpService();
    const followUp = await followUpService.createFollowUp(
      leadId,
      assignedToId,
      new Date(scheduledAt),
      note,
      req.user.id,
      req.user.role
    );

    return NextResponse.json(followUp, { status: 201 });
  })
);
