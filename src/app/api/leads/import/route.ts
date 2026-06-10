import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';
import { PaginationVo } from '../../../../domain/value-objects/pagination.vo';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const pagination = new PaginationVo(page, limit);

    const importService = container.getImportService();
    const result = await importService.getImportHistory(req.user.id, pagination, req.user.role);

    return NextResponse.json(result);
  })
);

export const POST = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const importService = container.getImportService();
    const history = await importService.importLeads(req.user.id, file.name, buffer);

    return NextResponse.json(history);
  })
);
