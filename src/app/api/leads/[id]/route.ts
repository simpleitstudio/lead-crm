import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;
    
    const leadService = container.getLeadService();
    const lead = await leadService.getLeadById(id, req.user.id, req.user.role);
    
    return NextResponse.json(lead);
  })
);

export const PUT = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;
    
    const body = await req.json();
    const leadService = container.getLeadService();
    const updated = await leadService.updateLead(id, body, req.user.id, req.user.role);
    
    return NextResponse.json(updated);
  })
);

export const DELETE = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;
    
    const leadService = container.getLeadService();
    await leadService.deleteLead(id, req.user.id, req.user.role);
    
    return NextResponse.json({ success: true });
  })
);
