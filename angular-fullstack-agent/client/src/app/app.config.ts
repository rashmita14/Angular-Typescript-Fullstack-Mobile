import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { AppErrorHandler } from './api/app-error-handler';
import {
  apiErrorInterceptor,
  authTokenInterceptor,
  correlationIdInterceptor,
  retryTransientGetInterceptor,
} from './api/http-interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withInterceptors([
        correlationIdInterceptor,
        authTokenInterceptor,
        apiErrorInterceptor,
        retryTransientGetInterceptor,
      ]),
    ),
    provideRouter(routes),
    provideClientHydration(),
    { provide: ErrorHandler, useClass: AppErrorHandler },
  ],
};
