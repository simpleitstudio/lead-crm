import { NextResponse } from 'next/server';
import { container } from '../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../middleware/error-handler.middleware';
import { PaginationVo } from '../../../domain/value-objects/pagination.vo';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const notificationService = container.getNotificationService();

    if (unreadOnly) {
      const items = await notificationService.getUnreadNotifications(req.user.id);
      return NextResponse.json({ items });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const pagination = new PaginationVo(page, limit);

    const result = await notificationService.getNotificationsForUser(req.user.id, pagination);
    return NextResponse.json(result);
  })
);

export const PUT = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    const markAll = searchParams.get('all') === 'true';
    const notificationService = container.getNotificationService();

    if (markAll) {
      await notificationService.markAllNotificationsAsRead(req.user.id);
      return NextResponse.json({ success: true });
    }

    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Notification ID (id) is required' }, { status: 400 });
    }

    await notificationService.markNotificationAsRead(id, req.user.id);
    return NextResponse.json({ success: true });
  })
);
