import { Component, computed, effect, signal } from '@angular/core';

@Component({
  selector: 'app-signals-demo',
  templateUrl: './signals-demo.component.html',
  styleUrl: './signals-demo.component.scss',
})
export class SignalsDemoComponent {
  protected readonly count = signal(0);
  protected readonly doubled = computed(() => this.count() * 2);

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
