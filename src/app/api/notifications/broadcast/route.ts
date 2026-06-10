import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';
import { UserRole } from '../../../../domain/enums/user-role.enum';
import { ForbiddenException } from '../../../../domain/exceptions/forbidden.exception';

export const POST = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can send notifications');
    }

    const body = await req.json();
    const { title, message, priority, recipientId, isGlobal } = body;

    if (!title || !message || !priority) {
      return NextResponse.json({ error: 'title, message, and priority are required' }, { status: 400 });
    }

    const notificationService = container.getNotificationService();
    const notification = await notificationService.createNotification(
      title,
      message,
      priority,
      recipientId || null,
      isGlobal === true,
      req.user.id
    );

    return NextResponse.json(notification, { status: 201 });
  })
);
