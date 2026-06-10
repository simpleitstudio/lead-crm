export abstract class BaseException extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): Record<string, unknown> {
    return {
      error: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
    };
  }
}
