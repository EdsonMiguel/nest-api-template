import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../../../../shared/application/cryptography/password-hasher';
import { User } from '../../domain/entities/user';
import { UsersRepository } from '../../domain/repositories/users.repository';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';

export type CreateUserUseCaseInput = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type CreateUserUseCaseOutput = {
  user: User;
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(
    input: CreateUserUseCaseInput,
  ): Promise<CreateUserUseCaseOutput> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const existingUserByEmail =
      await this.usersRepository.findByEmail(normalizedEmail);

    if (existingUserByEmail) {
      throw new UserAlreadyExistsError(normalizedEmail);
    }

    const existingUserByUsername = await this.usersRepository.findByUsername(
      input.username,
    );

    if (existingUserByUsername) {
      throw new UserAlreadyExistsError(input.username);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = User.create({
      name: input.name,
      username: input.username,
      email: normalizedEmail,
      passwordHash,
    });

    await this.usersRepository.create(user);

    return { user };
  }
}
