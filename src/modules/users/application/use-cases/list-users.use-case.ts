import { Injectable } from '@nestjs/common';
import {
  ListUsersParams,
  PaginatedUsersResult,
  UsersRepository,
} from '../../domain/repositories/users.repository';

export type ListUsersUseCaseInput = ListUsersParams;

export type ListUsersUseCaseOutput = PaginatedUsersResult;

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: ListUsersUseCaseInput): Promise<ListUsersUseCaseOutput> {
    return this.usersRepository.list(input);
  }
}
