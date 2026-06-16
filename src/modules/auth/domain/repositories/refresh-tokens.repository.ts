export type RefreshTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export type CreateRefreshTokenInput = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export abstract class RefreshTokensRepository {
  abstract create(input: CreateRefreshTokenInput): Promise<void>;
  abstract findValidByHash(
    tokenHash: string,
  ): Promise<RefreshTokenRecord | null>;
  abstract revokeByHash(tokenHash: string): Promise<void>;
}
