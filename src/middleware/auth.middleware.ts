import { NextRequest, NextResponse } from 'next/server';
import { container } from '../infrastructure/container/service-container';
import { UserEntity } from '../domain/entities/user.entity';

export interface AuthenticatedRequest extends NextRequest {
  user: UserEntity;
}

export type HandlerWithAuth = (req: AuthenticatedRequest, context: any) => Promise<Response> | Response;

export function withAuth(handler: HandlerWithAuth) {
  return async (req: NextRequest, context: any) => {
    try {
      const cookieService = container.getCookieService();
      const token = await cookieService.getAuthToken();
      if (!token) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      const authService = container.getAuthService();
      const user = await authService.verifyToken(token);

      const authenticatedRequest = req as AuthenticatedRequest;
      authenticatedRequest.user = user;

      return handler(authenticatedRequest, context);
    } catch (error: any) {
      return NextResponse.json({ error: error.message || 'Invalid or expired session' }, { status: 401 });
    }
  };
}
