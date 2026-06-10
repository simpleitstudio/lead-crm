import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';

export const PUT = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;
    
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const remarkService = container.getRemarkService();
    const updated = await remarkService.updateRemark(id, content, req.user.id, req.user.role);

    return NextResponse.json(updated);
  })
);

export const DELETE = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;

    const remarkService = container.getRemarkService();
    await remarkService.deleteRemark(id, req.user.id, req.user.role);

    return NextResponse.json({ success: true });
  })
);
