import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach } from 'vitest';
import { ApiError } from './api-error';
import { AuthTokenStore } from './auth-token.store';
import {
  apiErrorInterceptor,
  authTokenInterceptor,
  CORRELATION_ID_HEADER,
  correlationIdInterceptor,
  retryTransientGetInterceptor,
} from './http-interceptors';

describe('HTTP interceptors', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            correlationIdInterceptor,
            authTokenInterceptor,
            apiErrorInterceptor,
            retryTransientGetInterceptor,
          ]),
        ),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('adds a correlation id and an auth token only when one is available', () => {
    TestBed.inject(AuthTokenStore).setAccessToken('demo-access-token');
    let response: unknown;

    TestBed.inject(HttpClient).get('/api/tasks').subscribe((value) => (response = value));
    const request = TestBed.inject(HttpTestingController).expectOne('/api/tasks');

    expect(request.request.headers.get('Authorization')).toBe('Bearer demo-access-token');
    expect(request.request.headers.get(CORRELATION_ID_HEADER)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    request.flush([]);
    expect(response).toEqual([]);
  });

  it('maps HTTP failures to safe user-facing errors with a correlation id', () => {
    let requestError: unknown;
    TestBed.inject(HttpClient).get('/api/tasks').subscribe({
      error: (error: unknown) => (requestError = error),
    });

    const request = TestBed.inject(HttpTestingController).expectOne('/api/tasks');
    const correlationId = request.request.headers.get(CORRELATION_ID_HEADER);
    request.flush(
      { error: 'Invalid request details' },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(requestError).toBeInstanceOf(ApiError);
    expect((requestError as ApiError).message).toBe('Invalid request details');
    expect((requestError as ApiError).correlationId).toBe(correlationId);
  });

  it('retries transient GET failures twice, then maps the final error', async () => {
    let requestError: unknown;
    TestBed.inject(HttpClient).get('/api/tasks').subscribe({
      error: (error: unknown) => (requestError = error),
    });
    const controller = TestBed.inject(HttpTestingController);

    controller.expectOne('/api/tasks').flush(
      { error: 'Temporary outage' },
      { status: 503, statusText: 'Unavailable' },
    );
    await new Promise((resolve) => setTimeout(resolve, 220));
    controller.expectOne('/api/tasks').flush(
      { error: 'Temporary outage' },
      { status: 503, statusText: 'Unavailable' },
    );
    await new Promise((resolve) => setTimeout(resolve, 420));
    controller.expectOne('/api/tasks').flush(
      { error: 'Temporary outage' },
      { status: 503, statusText: 'Unavailable' },
    );

    expect(requestError).toBeInstanceOf(ApiError);
    expect((requestError as ApiError).status).toBe(503);
    expect((requestError as ApiError).message).toContain('temporarily unavailable');
  });

  it('does not retry mutations', () => {
    let requestError: unknown;
    TestBed.inject(HttpClient).post('/api/tasks', { title: 'Test' }).subscribe({
      error: (error: unknown) => (requestError = error),
    });

    TestBed.inject(HttpTestingController).expectOne('/api/tasks').flush(
      { error: 'Temporary outage' },
      { status: 503, statusText: 'Unavailable' },
    );

    expect(requestError).toBeInstanceOf(ApiError);
  });
});
