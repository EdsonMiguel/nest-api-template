import { Injectable } from '@nestjs/common';
import { RefreshTokensRepository } from '../../domain/repositories/refresh-tokens.repository';
import { RefreshTokenService } from '../services/refresh-token.service';

export type LogoutUseCaseInput = {
  refreshToken: string;
};

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly refreshTokensRepository: RefreshTokensRepository,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async execute(input: LogoutUseCaseInput): Promise<void> {
    const tokenHash = this.refreshTokenService.hash(input.refreshToken);

    await this.refreshTokensRepository.revokeByHash(tokenHash);
  }
}
