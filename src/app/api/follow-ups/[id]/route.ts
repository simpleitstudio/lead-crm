import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';

export const PUT = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;
    
    const body = await req.json();
    const { action, completionNote } = body;

    const followUpService = container.getFollowUpService();
    let result;

    if (action === 'complete') {
      result = await followUpService.completeFollowUp(id, completionNote, req.user.id, req.user.role);
    } else if (action === 'cancel') {
      result = await followUpService.cancelFollowUp(id, req.user.id, req.user.role);
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be complete or cancel' }, { status: 400 });
    }

    return NextResponse.json(result);
  })
);
