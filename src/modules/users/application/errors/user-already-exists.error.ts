import { ApplicationError } from '../../../../shared/application/errors/application-error';

export class UserAlreadyExistsError extends ApplicationError {
  constructor(identifier: string) {
    super(`User already exists: ${identifier}`, 409);
  }
}
