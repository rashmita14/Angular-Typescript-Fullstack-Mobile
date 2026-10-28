import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, retry, throwError, timer } from 'rxjs';
import { mapHttpError } from './api-error';
import { AuthTokenStore } from './auth-token.store';

export const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export const correlationIdInterceptor: HttpInterceptorFn = (request, next) => {
  const correlationId = globalThis.crypto.randomUUID();
  return next(
    request.clone({
      setHeaders: { [CORRELATION_ID_HEADER]: correlationId },
    }),
  );
};

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const token = inject(AuthTokenStore).getAccessToken();
  if (!token || request.headers.has('Authorization')) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const retryTransientGetInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    retry({
      count: 2,
      delay: (error: unknown, retryCount: number) => {
        if (
          request.method !== 'GET' ||
          !(error instanceof HttpErrorResponse) ||
          (error.status !== 0 && (error.status < 500 || error.status >= 600))
        ) {
          return throwError(() => error);
        }

        return timer(200 * 2 ** (retryCount - 1));
      },
    }),
  );

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        return throwError(() =>
          mapHttpError(error, request.headers.get(CORRELATION_ID_HEADER)),
        );
      }

      return throwError(() => error);
    }),
  );
