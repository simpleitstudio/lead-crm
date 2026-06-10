import { UserEntity } from '../../entities';

export interface IAuthService {
  login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ token: string; user: UserEntity }>;
  verifyToken(token: string): Promise<UserEntity>;
  logout(token: string, userId?: string): Promise<void>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}
