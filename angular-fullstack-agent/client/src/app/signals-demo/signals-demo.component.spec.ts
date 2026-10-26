import { TestBed } from '@angular/core/testing';
import { SignalsDemoComponent } from './signals-demo.component';

describe('SignalsDemoComponent', () => {
  it('updates signal state and recomputes the derived value', async () => {
    await TestBed.configureTestingModule({
      imports: [SignalsDemoComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SignalsDemoComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('output')?.textContent?.trim()).toBe('0');
    expect(host.querySelector('.derived-value strong')?.textContent?.trim()).toBe('0');

    host.querySelector<HTMLButtonElement>('[aria-label="Increase count"]')?.click();
    fixture.detectChanges();

    expect(host.querySelector('output')?.textContent?.trim()).toBe('1');
    expect(host.querySelector('.derived-value strong')?.textContent?.trim()).toBe('2');
  });
});
