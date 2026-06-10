import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly expiresIn: string = '24h';

  constructor() {
    this.secret = process.env.JWT_SECRET || 'leads-crm-default-jwt-secret-key-12345';
  }

  public sign(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn as any });
  }

  public verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
