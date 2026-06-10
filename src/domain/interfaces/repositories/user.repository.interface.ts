import { UserEntity } from '../../entities';
import { UserRole } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  phone?: string;
  isActive?: boolean;
  avatarUrl?: string;
  passwordHash?: string;
  lastLoginAt?: Date;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(pagination: PaginationVo): Promise<PaginatedResult<UserEntity>>;
  findByRole(role: UserRole): Promise<UserEntity[]>;
  findActiveSalesUsers(): Promise<UserEntity[]>;
  create(data: CreateUserData): Promise<UserEntity>;
  update(id: string, data: UpdateUserData): Promise<UserEntity>;
  softDelete(id: string): Promise<void>;
  count(): Promise<number>;
}
