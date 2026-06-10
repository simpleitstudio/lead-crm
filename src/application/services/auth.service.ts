import { IAuthService } from '../../domain/interfaces/services/auth.service.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { JwtService } from '../../infrastructure/auth/jwt.service';
import { IAuditLogRepository } from '../../domain/interfaces/repositories/audit-log.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UnauthorizedException } from '../../domain/exceptions/unauthorized.exception';
import { AuditActionType } from '../../domain/enums/audit-action-type.enum';
import { UserRole } from '../../domain/enums/user-role.enum';

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  public async login(email: string, password: string, ipAddress?: string, userAgent?: string): Promise<{ token: string; user: UserEntity }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      await this.auditLogRepository.create({
        userName: email,
        userRole: UserRole.SALES, // Default safe log role
        ipAddress,
        userAgent,
        actionType: AuditActionType.LOGIN_FAILED,
        entityType: 'User',
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await this.passwordService.compare(password, user.passwordHash);
    if (!isMatch) {
      await this.auditLogRepository.create({
        userId: user.id,
        userName: user.fullName,
        userRole: user.role,
        ipAddress,
        userAgent,
        actionType: AuditActionType.LOGIN_FAILED,
        entityType: 'User',
        entityId: user.id,
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    user.updateLastLogin();
    await this.userRepository.update(user.id, { lastLoginAt: user.lastLoginAt ?? undefined });

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.auditLogRepository.create({
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      ipAddress,
      userAgent,
      actionType: AuditActionType.LOGIN_SUCCESS,
      entityType: 'User',
      entityId: user.id,
    });

    return { token, user };
  }

  public async verifyToken(token: string): Promise<UserEntity> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findById(payload.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive or no longer exists');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  public async logout(token: string, userId?: string): Promise<void> {
    if (userId) {
      const user = await this.userRepository.findById(userId);
      if (user) {
        await this.auditLogRepository.create({
          userId: user.id,
          userName: user.fullName,
          userRole: user.role,
          actionType: AuditActionType.LOGOUT,
          entityType: 'User',
          entityId: user.id,
        });
      }
    }
  }

  public async hashPassword(password: string): Promise<string> {
    return this.passwordService.hash(password);
  }

  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return this.passwordService.compare(password, hash);
  }
}
