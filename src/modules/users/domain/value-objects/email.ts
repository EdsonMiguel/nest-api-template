import { ValueObject } from '../../../../shared/domain/value-objects/value-object';
import { InvalidEmailError } from '../errors/invalid-email.error';

type EmailProps = {
  value: string;
};

export class Email extends ValueObject<EmailProps> {
  private static readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(email: string): Email {
    const normalizedEmail = email.trim().toLowerCase();

    if (!this.isValid(normalizedEmail)) {
      throw new InvalidEmailError(email);
    }

    return new Email({ value: normalizedEmail });
  }

  private static isValid(email: string): boolean {
    return this.emailRegex.test(email);
  }
}
