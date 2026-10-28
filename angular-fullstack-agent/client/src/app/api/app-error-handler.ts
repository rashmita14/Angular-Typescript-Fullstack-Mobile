import { ErrorHandler, Injectable, signal } from '@angular/core';
import { toUserFacingMessage } from './api-error';

@Injectable({ providedIn: 'root' })
export class AppErrorNotifications {
  readonly message = signal<string | null>(null);

  show(message: string): void {
    this.message.set(message);
  }

  clear(): void {
    this.message.set(null);
  }
}

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  constructor(private readonly notifications: AppErrorNotifications) {}

  handleError(error: unknown): void {
    console.error('Unhandled application error:', error);
    this.notifications.show(toUserFacingMessage(error));
  }
}
