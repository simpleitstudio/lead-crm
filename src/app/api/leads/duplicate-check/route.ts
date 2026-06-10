import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    const email = searchParams.get('email') || undefined;
    const phone = searchParams.get('phone') || undefined;
    const website = searchParams.get('website') || undefined;

    const duplicateService = container.getDuplicateDetectionService();
    const result = await duplicateService.checkDuplicate(email, phone, website);

    return NextResponse.json(result);
  })
);
