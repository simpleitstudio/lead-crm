import { NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withRoles } from '../../../../middleware/rbac.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';
import { AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { UserRole } from '../../../../domain/enums/user-role.enum';

export const PUT = withErrorHandling(
  withRoles([UserRole.ADMIN], async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;
    
    const body = await req.json();
    const userService = container.getUserService();
    const updated = await userService.updateUser(id, body, req.user.id);

    return NextResponse.json(updated);
  })
);

export const DELETE = withErrorHandling(
  withRoles([UserRole.ADMIN], async (req: AuthenticatedRequest, context: any) => {
    const params = await context.params;
    const { id } = params;

    const userService = container.getUserService();
    await userService.deleteUser(id, req.user.id);

    return NextResponse.json({ success: true });
  })
);
