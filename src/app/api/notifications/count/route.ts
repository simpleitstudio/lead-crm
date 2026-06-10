import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const notificationService = container.getNotificationService();
    const count = await notificationService.getUnreadCount(req.user.id);
    return NextResponse.json({ count });
  })
);
