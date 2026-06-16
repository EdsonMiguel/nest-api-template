import { ApplicationError } from '../../../../shared/application/errors/application-error';

export class InvalidRefreshTokenError extends ApplicationError {
  constructor() {
    super('Invalid refresh token', 401);
  }
}
