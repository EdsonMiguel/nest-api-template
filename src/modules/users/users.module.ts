import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordHasher } from '../../shared/application/cryptography/password-hasher';
import { ScryptPasswordHasher } from '../../shared/infra/cryptography/scrypt-password-hasher';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { FindUserByEmailUseCase } from './application/use-cases/find-user-by-email.use-case';
import { FindUserByIdUseCase } from './application/use-cases/find-user-by-id.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { UsersRepository } from './domain/repositories/users.repository';
import { UserTypeormEntity } from './infra/database/typeorm/entities/user-typeorm.entity';
import { TypeormUsersRepository } from './infra/database/typeorm/repositories/typeorm-users.repository';
import { UsersController } from './presentation/http/users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserTypeormEntity])],
  controllers: [UsersController],
  providers: [
    CreateUserUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    ListUsersUseCase,
    {
      provide: UsersRepository,
      useClass: TypeormUsersRepository,
    },
    {
      provide: PasswordHasher,
      useClass: ScryptPasswordHasher,
    },
  ],
  exports: [
    CreateUserUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    ListUsersUseCase,
    UsersRepository,
  ],
})
export class UsersModule {}
