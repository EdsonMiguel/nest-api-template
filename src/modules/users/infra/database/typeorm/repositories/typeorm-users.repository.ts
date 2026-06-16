import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ListUsersParams,
  PaginatedUsersResult,
  UsersRepository,
} from '../../../../domain/repositories/users.repository';
import { User } from '../../../../domain/entities/user';
import { UserTypeormEntity } from '../entities/user-typeorm.entity';
import { UserTypeormMapper } from '../mappers/user-typeorm.mapper';

@Injectable()
export class TypeormUsersRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserTypeormEntity)
    private readonly repository: Repository<UserTypeormEntity>,
  ) {}

  async create(user: User): Promise<void> {
    const entity = UserTypeormMapper.toTypeorm(user);

    await this.repository.insert(entity);
  }

  async save(user: User): Promise<void> {
    const entity = UserTypeormMapper.toTypeorm(user);

    await this.repository.save(entity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });

    return entity ? UserTypeormMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    return entity ? UserTypeormMapper.toDomain(entity) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { username } });

    return entity ? UserTypeormMapper.toDomain(entity) : null;
  }

  async list(params: ListUsersParams): Promise<PaginatedUsersResult> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;
    const [entities, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return {
      data: entities.map((entity) => UserTypeormMapper.toDomain(entity)),
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  }
}
