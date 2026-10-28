import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach } from 'vitest';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';
import { TaskService } from './task.service';
import { App } from './app';

describe('App', () => {
  const tasks = [
    {
      id: 'one',
      title: 'Write a small plan',
      completed: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'two',
      title: 'Take a short break',
      completed: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];
  const taskService = {
    getTasks: () => of(tasks),
    invalidateTasks: () => undefined,
    createTask: (payload: { title: string }) =>
      of({ ...tasks[0], id: 'three', title: payload.title }),
    updateTask: (id: string, changes: { title?: string; completed?: boolean }) =>
      of({ ...tasks.find((task) => task.id === id)!, ...changes }),
    deleteTask: () => of(void 0),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: TaskService, useValue: taskService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('renders loaded tasks and their counts', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/health')
      .flush({ status: 'ok', database: 'connected' });

    expect(fixture.nativeElement.querySelectorAll('.task-row')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('.task-count').textContent).toContain('1');
    expect(fixture.nativeElement.textContent).toContain('1 completed');
  });

  it('filters the list to completed tasks', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.inject(HttpTestingController)
      .expectOne('/api/health')
      .flush({ status: 'ok', database: 'connected' });
    const host = fixture.nativeElement as HTMLElement;
    const doneButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Done',
    );

    doneButton?.click();
    fixture.detectChanges();

    expect(host.querySelectorAll('.task-row')).toHaveLength(1);
    expect(host.textContent).toContain('Take a short break');
  });

  it('cancels a superseded task request when refreshing', async () => {
    const firstRequest = new Subject<typeof tasks>();
    const secondRequest = new Subject<typeof tasks>();
    vi.spyOn(taskService, 'getTasks')
      .mockReturnValueOnce(firstRequest)
      .mockReturnValueOnce(secondRequest);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    TestBed.inject(HttpTestingController)
      .expectOne('/api/health')
      .flush({ status: 'ok', database: 'connected' });

    expect(firstRequest.observed).toBe(true);
    host.querySelector<HTMLButtonElement>('[aria-label="Refresh tasks"]')?.click();
    fixture.detectChanges();

    expect(firstRequest.observed).toBe(false);
    expect(secondRequest.observed).toBe(true);
    secondRequest.next([tasks[1]!]);
    secondRequest.complete();
    firstRequest.next(tasks);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance['tasks']()).toEqual([tasks[1]]);
    expect(host.querySelectorAll('.task-row')).toHaveLength(1);
    expect(host.textContent).toContain('Take a short break');
  });
});
