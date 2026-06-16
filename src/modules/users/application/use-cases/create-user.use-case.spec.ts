import { PasswordHasher } from '../../../../shared/application/cryptography/password-hasher';
import { User } from '../../domain/entities/user';
import {
  ListUsersParams,
  PaginatedUsersResult,
  UsersRepository,
} from '../../domain/repositories/users.repository';
import { UserAlreadyExistsError } from '../errors/user-already-exists.error';
import { CreateUserUseCase } from './create-user.use-case';

class InMemoryUsersRepository implements UsersRepository {
  users: User[] = [];

  create(user: User): Promise<void> {
    this.users.push(user);

    return Promise.resolve();
  }

  save(user: User): Promise<void> {
    const index = this.users.findIndex((item) => item.id === user.id);

    if (index >= 0) {
      this.users[index] = user;
      return Promise.resolve();
    }

    this.users.push(user);

    return Promise.resolve();
  }

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.users.find((user) => user.id === id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find((user) => user.email.value === email) ?? null,
    );
  }

  findByUsername(username: string): Promise<User | null> {
    return Promise.resolve(
      this.users.find((user) => user.username === username) ?? null,
    );
  }

  list(params: ListUsersParams): Promise<PaginatedUsersResult> {
    const page = params.page ?? 1;
    const perPage = params.perPage ?? 20;

    return Promise.resolve({
      data: this.users,
      total: this.users.length,
      page,
      perPage,
      totalPages: Math.ceil(this.users.length / perPage),
    });
  }
}

class FakePasswordHasher implements PasswordHasher {
  hash(plainText: string): Promise<string> {
    return Promise.resolve(`hashed:${plainText}`);
  }

  compare(plainText: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plainText}`);
  }
}

describe('CreateUserUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let passwordHasher: FakePasswordHasher;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    passwordHasher = new FakePasswordHasher();
    useCase = new CreateUserUseCase(usersRepository, passwordHasher);
  });

  it('should create a user with hashed password', async () => {
    const { user } = await useCase.execute({
      name: 'Jane Doe',
      username: 'jane',
      email: 'JANE@example.com',
      password: 'secret',
    });

    expect(user.name).toBe('Jane Doe');
    expect(user.username).toBe('jane');
    expect(user.email.value).toBe('jane@example.com');
    expect(user.passwordHash).toBe('hashed:secret');
    expect(usersRepository.users).toHaveLength(1);
  });

  it('should not create a user when email already exists', async () => {
    await useCase.execute({
      name: 'Jane Doe',
      username: 'jane',
      email: 'jane@example.com',
      password: 'secret',
    });

    await expect(
      useCase.execute({
        name: 'John Doe',
        username: 'john',
        email: 'jane@example.com',
        password: 'secret',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });

  it('should not create a user when username already exists', async () => {
    await useCase.execute({
      name: 'Jane Doe',
      username: 'jane',
      email: 'jane@example.com',
      password: 'secret',
    });

    await expect(
      useCase.execute({
        name: 'John Doe',
        username: 'jane',
        email: 'john@example.com',
        password: 'secret',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);
  });
});
