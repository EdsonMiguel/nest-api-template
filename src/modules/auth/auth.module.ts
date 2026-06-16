import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { SignOptions } from 'jsonwebtoken';
import { PasswordHasher } from '../../shared/application/cryptography/password-hasher';
import { ScryptPasswordHasher } from '../../shared/infra/cryptography/scrypt-password-hasher';
import { UsersModule } from '../users/users.module';
import { RefreshTokensRepository } from './domain/repositories/refresh-tokens.repository';
import { RefreshTokenService } from './application/services/refresh-token.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { RefreshTokenTypeormEntity } from './infra/database/typeorm/entities/refresh-token-typeorm.entity';
import { TypeormRefreshTokensRepository } from './infra/database/typeorm/repositories/typeorm-refresh-tokens.repository';
import { JwtStrategy } from './infra/http/strategies/jwt.strategy';
import { AuthController } from './presentation/http/auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshTokenTypeormEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const expiresIn = config.getOrThrow<string>(
          'auth.jwt.accessExpiresIn',
        ) as SignOptions['expiresIn'];

        return {
          secret: config.getOrThrow<string>('auth.jwt.accessSecret'),
          signOptions: { expiresIn },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    RefreshTokenService,
    JwtStrategy,
    {
      provide: PasswordHasher,
      useClass: ScryptPasswordHasher,
    },
    {
      provide: RefreshTokensRepository,
      useClass: TypeormRefreshTokensRepository,
    },
  ],
})
export class AuthModule {}
