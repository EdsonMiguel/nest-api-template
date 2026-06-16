import { DomainError } from '../../../../shared/domain/errors/domain-error';

export class InvalidEmailError extends DomainError {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
  }
}
