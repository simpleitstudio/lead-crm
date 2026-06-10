import { BaseException } from './base.exception';

export class ValidationException extends BaseException {
  public readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>, message = 'Validation failed') {
    super(message, 422, 'VALIDATION_ERROR');
    this.errors = errors;
  }

  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}
