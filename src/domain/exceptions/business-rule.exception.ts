import { BaseException } from './base.exception';

export class BusinessRuleException extends BaseException {
  constructor(message: string) {
    super(message, 400, 'BUSINESS_RULE_VIOLATION');
  }
}
