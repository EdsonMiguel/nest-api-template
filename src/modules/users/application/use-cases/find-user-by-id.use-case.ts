import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user';
import { UsersRepository } from '../../domain/repositories/users.repository';

export type FindUserByIdUseCaseInput = {
  id: string;
};

export type FindUserByIdUseCaseOutput = {
  user: User | null;
};

@Injectable()
export class FindUserByIdUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    input: FindUserByIdUseCaseInput,
  ): Promise<FindUserByIdUseCaseOutput> {
    const user = await this.usersRepository.findById(input.id);

    return { user };
  }
}
