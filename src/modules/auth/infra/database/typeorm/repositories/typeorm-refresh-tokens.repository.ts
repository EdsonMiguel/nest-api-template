import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import {
  CreateRefreshTokenInput,
  RefreshTokenRecord,
  RefreshTokensRepository,
} from '../../../../domain/repositories/refresh-tokens.repository';
import { RefreshTokenTypeormEntity } from '../entities/refresh-token-typeorm.entity';

@Injectable()
export class TypeormRefreshTokensRepository implements RefreshTokensRepository {
  constructor(
    @InjectRepository(RefreshTokenTypeormEntity)
    private readonly repository: Repository<RefreshTokenTypeormEntity>,
  ) {}

  async create(input: CreateRefreshTokenInput): Promise<void> {
    await this.repository.insert(input);
  }

  async findValidByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const entity = await this.repository.findOne({
      where: {
        tokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });

    return entity ?? null;
  }

  async revokeByHash(tokenHash: string): Promise<void> {
    await this.repository.update(
      {
        tokenHash,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }
}
