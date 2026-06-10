import { NextResponse } from 'next/server';
import { UserRole } from '../domain/enums/user-role.enum';
import { AuthenticatedRequest, HandlerWithAuth, withAuth } from './auth.middleware';

export function withRoles(roles: UserRole[], handler: HandlerWithAuth) {
  return withAuth(async (req: AuthenticatedRequest, context: any) => {
    if (!roles.includes(req.user.role)) {
      return NextResponse.json(
        { error: `Forbidden: Access requires one of the following roles: ${roles.join(', ')}` },
        { status: 403 }
      );
    }
    return handler(req, context);
  });
}
