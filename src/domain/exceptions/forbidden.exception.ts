import { BaseException } from './base.exception';

export class ForbiddenException extends BaseException {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}
