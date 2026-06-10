import { IUserService } from '../../domain/interfaces/services/user.service.interface';
import { IUserRepository, CreateUserData, UpdateUserData } from '../../domain/interfaces/repositories/user.repository.interface';
import { PasswordService } from '../../infrastructure/auth/password.service';
import { UserEntity } from '../../domain/entities/user.entity';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ValidationException } from '../../domain/exceptions/validation.exception';

export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService
  ) {}

  public async createUser(data: CreateUserData, performerId?: string): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ValidationException({ email: [`A user with email "${data.email}" already exists`] }, 'User validation failed');
    }

    // Hash the password received from the presentation/DTO layer
    const passwordHash = await this.passwordService.hash(data.passwordHash);
    
    return this.userRepository.create({
      ...data,
      passwordHash,
    });
  }

  public async updateUser(id: string, data: UpdateUserData, performerId?: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedData = { ...data };
    if (data.passwordHash && !data.passwordHash.startsWith('$2b$')) {
      updatedData.passwordHash = await this.passwordService.hash(data.passwordHash);
    }

    return this.userRepository.update(id, updatedData);
  }

  public async getUserById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findById(id);
  }

  public async getUserByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findByEmail(email);
  }

  public async getUsers(pagination: PaginationVo): Promise<PaginatedResult<UserEntity>> {
    return this.userRepository.findAll(pagination);
  }

  public async deleteUser(id: string, performerId?: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.softDelete(id);
  }

  public async getActiveSalesUsers(): Promise<UserEntity[]> {
    return this.userRepository.findActiveSalesUsers();
  }
}
