import { NextRequest, NextResponse } from 'next/server';
import { container } from '../../../../infrastructure/container/service-container';
import { withErrorHandling } from '../../../../middleware/error-handler.middleware';

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || 'Unknown';

  const authService = container.getAuthService();
  const { token, user } = await authService.login(email, password, ipAddress, userAgent);

  const cookieService = container.getCookieService();
  await cookieService.setAuthToken(token);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      fullName: user.fullName,
    },
  });
});
