import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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
    createTask: (title: string) => of({ ...tasks[0], id: 'three', title }),
    updateTask: (id: string, changes: { title?: string; completed?: boolean }) =>
      of({ ...tasks.find((task) => task.id === id)!, ...changes }),
    deleteTask: () => of(void 0),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: TaskService, useValue: taskService }],
    }).compileComponents();
  });

  it('renders loaded tasks and their counts', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.task-row')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('.task-count').textContent).toContain('1');
    expect(fixture.nativeElement.textContent).toContain('1 completed');
  });

  it('filters the list to completed tasks', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const doneButton = Array.from(host.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Done',
    );

    doneButton?.click();
    fixture.detectChanges();

    expect(host.querySelectorAll('.task-row')).toHaveLength(1);
    expect(host.textContent).toContain('Take a short break');
  });
});
