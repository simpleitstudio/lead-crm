import { NextResponse } from 'next/server';
import { container } from '../../../infrastructure/container/service-container';
import { withRoles } from '../../../middleware/rbac.middleware';
import { withErrorHandling } from '../../../middleware/error-handler.middleware';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { PaginationVo } from '../../../domain/value-objects/pagination.vo';

export const GET = withErrorHandling(
  withRoles([UserRole.ADMIN], async (req: AuthenticatedRequest) => {
    const { searchParams } = req.nextUrl;
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const pagination = new PaginationVo(page, limit);

    const userService = container.getUserService();
    const result = await userService.getUsers(pagination);

    return NextResponse.json(result);
  })
);

export const POST = withErrorHandling(
  withRoles([UserRole.ADMIN], async (req: AuthenticatedRequest) => {
    const body = await req.json();
    const { email, password, firstName, lastName, role, phone } = body;

    if (!email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'email, password, firstName, lastName, and role are required' }, { status: 400 });
    }

    const userService = container.getUserService();
    const user = await userService.createUser(
      { email, passwordHash: password, firstName, lastName, role, phone },
      req.user.id
    );

    return NextResponse.json(user, { status: 201 });
  })
);
