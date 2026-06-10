import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';
import { LeadStatus } from '../../../../domain/enums/lead-status.enum';
import { LeadPriority } from '../../../../domain/enums/lead-priority.enum';
import { LeadSource } from '../../../../domain/enums/lead-source.enum';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;

    const status = searchParams.get('status') as LeadStatus || undefined;
    const priority = searchParams.get('priority') as LeadPriority || undefined;
    const source = searchParams.get('source') as LeadSource || undefined;
    const search = searchParams.get('search') || undefined;
    const country = searchParams.get('country') || undefined;
    const industry = searchParams.get('industry') || undefined;

    const exportService = container.getExportService();
    const { fileName, fileBuffer } = await exportService.exportLeads(
      req.user.id,
      { status, priority, source, search, country, industry },
      'csv'
    );

    return new Response(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  })
);
