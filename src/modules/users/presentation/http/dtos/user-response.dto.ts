import { ApiProperty } from '@nestjs/swagger';
import type { EntityId } from '../../../../../shared/domain/entities/entity';
import { User } from '../../../domain/entities/user';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: EntityId;

  @ApiProperty({ example: 'Jane Doe' })
  name!: string;

  @ApiProperty({ example: 'jane' })
  username!: string;

  @ApiProperty({ example: 'jane@example.com' })
  email!: string;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}

export class UserResponseMapper {
  static fromDomain(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email.value,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
