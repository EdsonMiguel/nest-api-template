import { randomUUID } from 'node:crypto';
import { Entity, EntityId } from '../../../../shared/domain/entities/entity';
import { Email } from '../value-objects/email';

export type UserProps = {
  name: string;
  username: string;
  email: Email;
  passwordHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateUserProps = {
  id?: EntityId;
  name: string;
  username: string;
  email: string | Email;
  passwordHash: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id: EntityId) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(props: CreateUserProps): User {
    const now = new Date();
    const email =
      props.email instanceof Email ? props.email : Email.create(props.email);

    return new User(
      {
        name: props.name,
        username: props.username,
        email,
        passwordHash: props.passwordHash,
        isActive: props.isActive ?? true,
        createdAt: props.createdAt ?? now,
        updatedAt: props.updatedAt ?? now,
      },
      props.id ?? randomUUID(),
    );
  }

  activate(): void {
    this.props.isActive = true;
    this.touch();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
