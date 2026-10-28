import { isPlatformBrowser } from '@angular/common';
import { httpResource } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import type { Health } from '../api/generated';
import { toUserFacingMessage } from '../api/api-error';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-signals-demo',
  templateUrl: './signals-demo.component.html',
  styleUrl: './signals-demo.component.scss',
  // The template-read signals notify Angular when their values change.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalsDemoComponent {
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly count = signal(0);
  protected readonly doubled = computed(() => this.count() * 2);
  protected readonly apiHealth = httpResource<Health>(() =>
    isPlatformBrowser(this.platformId) ? `${environment.apiUrl}/health` : undefined,
  );
  protected readonly apiHealthErrorMessage = computed(() => {
    const error = this.apiHealth.error();
    return error ? toUserFacingMessage(error) : null;
  });

  constructor() {
    effect(() => {
      console.info(`[Signals demo] count is now ${this.count()}`);
    });
  }

  protected increment(): void {
    this.count.update((current) => current + 1);
  }

  protected decrement(): void {
    this.count.update((current) => current - 1);
  }

  protected reset(): void {
    this.count.set(0);
  }
}
