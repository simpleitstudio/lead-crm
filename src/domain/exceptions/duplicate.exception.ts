import { BaseException } from './base.exception';

export class DuplicateException extends BaseException {
  public readonly duplicateFields: string[];

  constructor(entity: string, duplicateFields: string[]) {
    const fieldsStr = duplicateFields.join(', ');
    super(
      `${entity} already exists with matching ${fieldsStr}`,
      409,
      'DUPLICATE_ENTRY',
    );
    this.duplicateFields = duplicateFields;
  }

  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      duplicateFields: this.duplicateFields,
    };
  }
}
