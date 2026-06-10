import { NextResponse } from 'next/server';
import { container } from '../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../middleware/error-handler.middleware';
import { PaginationVo } from '../../../domain/value-objects/pagination.vo';
import { LeadStatus } from '../../../domain/enums/lead-status.enum';
import { LeadPriority } from '../../../domain/enums/lead-priority.enum';
import { LeadSource } from '../../../domain/enums/lead-source.enum';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    
    const status = searchParams.get('status') as LeadStatus || undefined;
    const priority = searchParams.get('priority') as LeadPriority || undefined;
    const source = searchParams.get('source') as LeadSource || undefined;
    const search = searchParams.get('search') || undefined;
    const country = searchParams.get('country') || undefined;
    const industry = searchParams.get('industry') || undefined;
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const pagination = new PaginationVo(page, limit);
    const leadService = container.getLeadService();
    
    const result = await leadService.getLeads(
      { status, priority, source, search, country, industry },
      pagination,
      req.user.id,
      req.user.role
    );
    
    return NextResponse.json(result);
  })
);

export const POST = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const body = await req.json();
    const leadService = container.getLeadService();
    
    const result = await leadService.createLead(body, req.user.id);
    
    return NextResponse.json(result, { status: 201 });
  })
);
