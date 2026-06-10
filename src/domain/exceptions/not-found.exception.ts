import { BaseException } from './base.exception';

export class NotFoundException extends BaseException {
  constructor(entity: string, identifier?: string) {
    const message = identifier
      ? `${entity} with identifier "${identifier}" was not found`
      : `${entity} was not found`;
    super(message, 404, 'NOT_FOUND');
  }
}
