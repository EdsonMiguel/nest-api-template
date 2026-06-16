import { User } from '../entities/user';

export type ListUsersParams = {
  page?: number;
  perPage?: number;
};

export type PaginatedUsersResult = {
  data: User[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export abstract class UsersRepository {
  abstract create(user: User): Promise<void>;
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByUsername(username: string): Promise<User | null>;
  abstract list(params: ListUsersParams): Promise<PaginatedUsersResult>;
}
