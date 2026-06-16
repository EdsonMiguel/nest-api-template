export type EntityId = string | number;

export abstract class Entity<Props> {
  protected constructor(
    protected readonly props: Props,
    private readonly entityId: EntityId,
  ) {}

  get id(): EntityId {
    return this.entityId;
  }

  equals(entity?: Entity<Props>): boolean {
    if (!entity) {
      return false;
    }

    if (this === entity) {
      return true;
    }

    return this.id === entity.id;
  }

  toJSON(): Props & { id: EntityId } {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
