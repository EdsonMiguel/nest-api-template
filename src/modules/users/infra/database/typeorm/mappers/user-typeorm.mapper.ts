import { User } from '../../../../domain/entities/user';
import { UserTypeormEntity } from '../entities/user-typeorm.entity';

export class UserTypeormMapper {
  static toDomain(entity: UserTypeormEntity): User {
    return User.create({
      id: entity.id,
      name: entity.name,
      username: entity.username,
      email: entity.email,
      passwordHash: entity.passwordHash,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toTypeorm(user: User): UserTypeormEntity {
    const entity = new UserTypeormEntity();

    entity.id = String(user.id);
    entity.name = user.name;
    entity.username = user.username;
    entity.email = user.email.value;
    entity.passwordHash = user.passwordHash;
    entity.isActive = user.isActive;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;

    return entity;
  }
}
