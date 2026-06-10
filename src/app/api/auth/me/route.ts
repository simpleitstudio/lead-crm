import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '../../../../middleware/auth.middleware';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';
import { container } from '../../../../infrastructure/container/service-container';

export const GET = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const user = req.user;
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        fullName: user.fullName,
      },
    });
  })
);

export const PUT = withErrorHandling(
  withAuth(async (req: AuthenticatedRequest) => {
    const user = req.user;
    const body = await req.json();

    const dataToUpdate: any = {};
    if (body.firstName !== undefined) dataToUpdate.firstName = body.firstName;
    if (body.lastName !== undefined) dataToUpdate.lastName = body.lastName;
    if (body.phone !== undefined) dataToUpdate.phone = body.phone || null;
    if (body.password !== undefined && body.password !== '') {
      dataToUpdate.passwordHash = body.password; // Will be hashed by UserService if not starting with $2b$
    }

    const userService = container.getUserService();
    const updatedUser = await userService.updateUser(user.id, dataToUpdate, user.id);

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        fullName: updatedUser.fullName,
      },
    });
  })
);

