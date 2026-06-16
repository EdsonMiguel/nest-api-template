import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user';
import { UsersRepository } from '../../domain/repositories/users.repository';

export type FindUserByEmailUseCaseInput = {
  email: string;
};

export type FindUserByEmailUseCaseOutput = {
  user: User | null;
};

@Injectable()
export class FindUserByEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    input: FindUserByEmailUseCaseInput,
  ): Promise<FindUserByEmailUseCaseOutput> {
    const user = await this.usersRepository.findByEmail(
      input.email.trim().toLowerCase(),
    );

    return { user };
  }
}
