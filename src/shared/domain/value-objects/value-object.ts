export abstract class ValueObject<Props> {
  protected constructor(protected readonly props: Props) {}

  equals(valueObject?: ValueObject<Props>): boolean {
    if (!valueObject) {
      return false;
    }

    if (this === valueObject) {
      return true;
    }

    return JSON.stringify(this.props) === JSON.stringify(valueObject.props);
  }

  toJSON(): Props {
    return this.props;
  }
}
