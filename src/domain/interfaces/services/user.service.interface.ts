import { UserEntity } from '../../entities';
import { CreateUserData, UpdateUserData } from '../repositories/user.repository.interface';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface IUserService {
  createUser(data: CreateUserData, performerId?: string): Promise<UserEntity>;
  updateUser(id: string, data: UpdateUserData, performerId?: string): Promise<UserEntity>;
  getUserById(id: string): Promise<UserEntity | null>;
  getUserByEmail(email: string): Promise<UserEntity | null>;
  getUsers(pagination: PaginationVo): Promise<PaginatedResult<UserEntity>>;
  deleteUser(id: string, performerId?: string): Promise<void>;
  getActiveSalesUsers(): Promise<UserEntity[]>;
}
