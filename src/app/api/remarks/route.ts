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
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const pagination = new PaginationVo(page, limit);

    const remarkService = container.getRemarkService();
    const result = await remarkService.getRemarksByLeadId(leadId, pagination, req.user.id, req.user.role);

    return NextResponse.json(result);
  })
);

export const POST = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const body = await req.json();
    const { leadId, content } = body;

    if (!leadId || !content) {
      return NextResponse.json({ error: 'leadId and content are required' }, { status: 400 });
    }

    const remarkService = container.getRemarkService();
    const remark = await remarkService.createRemark(leadId, content, req.user.id);

    return NextResponse.json(remark, { status: 201 });
  })
);
