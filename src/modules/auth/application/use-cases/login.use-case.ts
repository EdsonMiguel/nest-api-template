import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { PasswordHasher } from '../../../../shared/application/cryptography/password-hasher';
import { UsersRepository } from '../../../users/domain/repositories/users.repository';
import { UserResponseMapper } from '../../../users/presentation/http/dtos/user-response.dto';
import { RefreshTokensRepository } from '../../domain/repositories/refresh-tokens.repository';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { RefreshTokenService } from '../services/refresh-token.service';

export type LoginUseCaseInput = {
  email: string;
  password: string;
};

export type LoginUseCaseOutput = {
  accessToken: string;
  refreshToken: string;
  user: ReturnType<typeof UserResponseMapper.fromDomain>;
};

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly jwtService: JwtService,
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    const email = input.email.trim().toLowerCase();
    const user = await this.usersRepository.findByEmail(email);

    if (!user || !user.isActive) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    const accessToken = await this.jwtService.signAsync({
      sub: String(user.id),
      email: user.email.value,
      username: user.username,
    });
    const refreshToken = this.refreshTokenService.generateToken();

    await this.refreshTokensRepository.create({
      id: randomUUID(),
      userId: String(user.id),
      tokenHash: this.refreshTokenService.hash(refreshToken),
      expiresAt: this.refreshTokenService.getExpiresAt(),
    });

    return {
      accessToken,
      refreshToken,
      user: UserResponseMapper.fromDomain(user),
    };
  }
}
