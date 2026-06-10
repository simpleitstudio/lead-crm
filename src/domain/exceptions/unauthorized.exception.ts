import { BaseException } from './base.exception';

export class UnauthorizedException extends BaseException {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}
