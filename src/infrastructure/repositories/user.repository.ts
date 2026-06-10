import { prisma } from '../database/prisma.client';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { IUserRepository, CreateUserData, UpdateUserData } from '../../domain/interfaces/repositories/user.repository.interface';

export class UserRepository implements IUserRepository {
  public async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    return user ? UserEntity.fromPrisma(user) : null;
  }

  public async findAll(pagination: PaginationVo): Promise<PaginatedResult<UserEntity>> {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { deletedAt: null },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({
        where: { deletedAt: null },
      }),
    ]);

    return createPaginatedResult(
      items.map(item => UserEntity.fromPrisma(item)),
      total,
      pagination
    );
  }

  public async findByRole(role: UserRole): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      where: { role, deletedAt: null },
      orderBy: { firstName: 'asc' },
    });
    return users.map(user => UserEntity.fromPrisma(user));
  }

  public async findActiveSalesUsers(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      where: {
        role: UserRole.SALES,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { firstName: 'asc' },
    });
    return users.map(user => UserEntity.fromPrisma(user));
  }

  public async create(data: CreateUserData): Promise<UserEntity> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone ?? null,
        isActive: true,
      },
    });
    return UserEntity.fromPrisma(user);
  }

  public async update(id: string, data: UpdateUserData): Promise<UserEntity> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        phone: data.phone,
        isActive: data.isActive,
        avatarUrl: data.avatarUrl,
        passwordHash: data.passwordHash,
        lastLoginAt: data.lastLoginAt,
      },
    });
    return UserEntity.fromPrisma(user);
  }

  public async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  public async count(): Promise<number> {
    return prisma.user.count({
      where: { deletedAt: null },
    });
  }
}
