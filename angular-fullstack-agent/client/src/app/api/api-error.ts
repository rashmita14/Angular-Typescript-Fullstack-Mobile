import { HttpErrorResponse } from '@angular/common/http';
import type { ApiError as ApiErrorBody } from './generated';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly correlationId: string | null,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function mapHttpError(error: HttpErrorResponse, correlationId: string | null): ApiError {
  const responseBody = isApiErrorBody(error.error) ? error.error : null;
  const message = getUserMessage(error.status, responseBody?.error);
  return new ApiError(error.status, message, correlationId);
}

export function toUserFacingMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.correlationId
      ? `${error.message} (Reference: ${error.correlationId})`
      : error.message;
  }

  return 'Something went wrong. Please try again.';
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'string'
  );
}

function getUserMessage(status: number, serverMessage?: string): string {
  switch (status) {
    case 0:
      return 'The service could not be reached. Check your connection and try again.';
    case 400:
      return serverMessage ?? 'The request could not be completed. Check your input.';
    case 401:
      return 'Please sign in again to continue.';
    case 403:
      return 'You do not have permission to do that.';
    case 404:
      return 'The requested item could not be found.';
    case 429:
      return 'There have been too many requests. Please wait and try again.';
    default:
      return status >= 500
        ? 'The service is temporarily unavailable. Please try again.'
        : 'The request could not be completed. Please try again.';
  }
}
