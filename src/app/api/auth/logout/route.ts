import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';

export const POST = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const cookieService = container.getCookieService();
    const token = await cookieService.getAuthToken();

    if (token) {
      const authService = container.getAuthService();
      await authService.logout(token, req.user.id);
    }

    await cookieService.removeAuthToken();
    
    return NextResponse.json({ success: true });
  })
);
