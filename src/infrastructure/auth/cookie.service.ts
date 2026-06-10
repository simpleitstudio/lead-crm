import { cookies } from 'next/headers';

export class CookieService {
  private readonly cookieName = 'auth_token';

  public async setAuthToken(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set(this.cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  public async getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(this.cookieName)?.value ?? null;
  }

  public async removeAuthToken(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.cookieName);
  }
}
