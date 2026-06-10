import { NextResponse } from 'next/server';
import { BaseException } from '../domain/exceptions/base.exception';

export function withErrorHandling(handler: (...args: any[]) => Promise<Response> | Response) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      // Log error for debugging
      console.error('[API Error Handled]:', error);

      if (error instanceof BaseException) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }

      // Default fallback
      return NextResponse.json(
        { error: 'An unexpected internal server error occurred' },
        { status: 500 }
      );
    }
  };
}
