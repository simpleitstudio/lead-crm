export class LoggerService {
  private formatMessage(level: string, message: string, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : '';
    return `[${timestamp}] [${level}] ${contextStr}${message}`;
  }

  public info(message: string, context?: string, metadata?: unknown): void {
    console.log(
      this.formatMessage('INFO', message, context),
      metadata ? JSON.stringify(metadata, null, 2) : ''
    );
  }

  public error(message: string, error?: unknown, context?: string): void {
    console.error(
      this.formatMessage('ERROR', message, context),
      error instanceof Error ? error.stack : error
    );
  }

  public warn(message: string, context?: string, metadata?: unknown): void {
    console.warn(
      this.formatMessage('WARN', message, context),
      metadata ? JSON.stringify(metadata, null, 2) : ''
    );
  }

  public debug(message: string, context?: string, metadata?: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        this.formatMessage('DEBUG', message, context),
        metadata ? JSON.stringify(metadata, null, 2) : ''
      );
    }
  }
}
