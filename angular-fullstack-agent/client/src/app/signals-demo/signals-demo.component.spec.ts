import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach } from 'vitest';
import { SignalsDemoComponent } from './signals-demo.component';

describe('SignalsDemoComponent', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('updates signal state and recomputes the derived value', async () => {
    await TestBed.configureTestingModule({
      imports: [SignalsDemoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignalsDemoComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    TestBed.inject(HttpTestingController)
      .expectOne('/api/health')
      .flush({ status: 'ok', database: 'connected' });

    expect(host.querySelector('output')?.textContent?.trim()).toBe('0');
    expect(host.querySelector('.derived-value strong')?.textContent?.trim()).toBe('0');

    host.querySelector<HTMLButtonElement>('[aria-label="Increase count"]')?.click();
    await fixture.whenStable();

    expect(host.querySelector('output')?.textContent?.trim()).toBe('1');
    expect(host.querySelector('.derived-value strong')?.textContent?.trim()).toBe('2');
    expect(host.textContent).toContain('OnPush + signals + zoneless');
    expect(host.textContent).toContain('zoneless is the default');
  });
});
