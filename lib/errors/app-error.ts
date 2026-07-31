export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  STATE_TRANSITION_ERROR = 'STATE_TRANSITION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Mantener el prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static validation(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }

  static notFound(message: string): AppError {
    return new AppError(ErrorCode.NOT_FOUND, message, 404);
  }

  static stateTransition(message: string): AppError {
    return new AppError(ErrorCode.STATE_TRANSITION_ERROR, message, 400);
  }

  static database(message: string): AppError {
    return new AppError(ErrorCode.DATABASE_ERROR, message, 503);
  }

  static internal(message: string): AppError {
    return new AppError(ErrorCode.INTERNAL_ERROR, message, 500);
  }
}
