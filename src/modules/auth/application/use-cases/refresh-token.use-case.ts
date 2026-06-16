import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { UsersRepository } from '../../../users/domain/repositories/users.repository';
import { UserResponseMapper } from '../../../users/presentation/http/dtos/user-response.dto';
import { RefreshTokensRepository } from '../../domain/repositories/refresh-tokens.repository';
import { InvalidRefreshTokenError } from '../errors/invalid-refresh-token.error';
import { RefreshTokenService } from '../services/refresh-token.service';

export type RefreshTokenUseCaseInput = {
  refreshToken: string;
};

export type RefreshTokenUseCaseOutput = {
  accessToken: string;
  refreshToken: string;
  user: ReturnType<typeof UserResponseMapper.fromDomain>;
};

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    input: RefreshTokenUseCaseInput,
  ): Promise<RefreshTokenUseCaseOutput> {
    const tokenHash = this.refreshTokenService.hash(input.refreshToken);
    const storedToken =
      await this.refreshTokensRepository.findValidByHash(tokenHash);

    if (!storedToken) {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.usersRepository.findById(storedToken.userId);

    if (!user || !user.isActive) {
      throw new InvalidRefreshTokenError();
    }

    await this.refreshTokensRepository.revokeByHash(tokenHash);

    const refreshToken = this.refreshTokenService.generateToken();
    await this.refreshTokensRepository.create({
      id: randomUUID(),
      userId: String(user.id),
      tokenHash: this.refreshTokenService.hash(refreshToken),
      expiresAt: this.refreshTokenService.getExpiresAt(),
    });

    const accessToken = await this.jwtService.signAsync({
      sub: String(user.id),
      email: user.email.value,
      username: user.username,
    });

    return {
      accessToken,
      refreshToken,
      user: UserResponseMapper.fromDomain(user),
    };
  }
}
