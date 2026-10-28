import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, finalize, startWith, Subject, switchMap, catchError } from 'rxjs';
import { AppErrorNotifications } from './api/app-error-handler';
import { toUserFacingMessage } from './api/api-error';
import { SignalsDemoComponent } from './signals-demo/signals-demo.component';
import { Task, TaskFilter } from './task.model';
import { TaskService } from './task.service';

@Component({
  imports: [FormsModule, SignalsDemoComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private readonly refreshRequests = new Subject<void>();
  private readonly errorNotifications = inject(AppErrorNotifications);

  protected readonly globalErrorMessage = this.errorNotifications.message;
  protected readonly tasks = signal<Task[]>([]);
  protected readonly filter = signal<TaskFilter>('all');
  protected readonly title = signal('');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly canRetryLoad = signal(false);
  protected readonly remainingCount = computed(
    () => this.tasks().filter((task) => !task.completed).length,
  );
  protected readonly completedCount = computed(
    () => this.tasks().length - this.remainingCount(),
  );
  protected readonly filteredTasks = computed(() => {
    const currentFilter = this.filter();
    return this.tasks().filter((task) => {
      if (currentFilter === 'active') return !task.completed;
      if (currentFilter === 'completed') return task.completed;
      return true;
    });
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.refreshRequests
        .pipe(
          startWith(void 0),
          switchMap(() => {
            this.loading.set(true);
            this.error.set(null);
            this.canRetryLoad.set(false);

            return this.taskService.getTasks().pipe(
              catchError((error: unknown) => {
                this.error.set(toUserFacingMessage(error));
                this.canRetryLoad.set(true);
                return EMPTY;
              }),
              finalize(() => this.loading.set(false)),
            );
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((tasks) => this.tasks.set(tasks));
    }
  }

  protected loadTasks(): void {
    this.taskService.invalidateTasks();
    this.refreshRequests.next();
  }

  protected clearGlobalError(): void {
    this.errorNotifications.clear();
  }

  protected addTask(): void {
    const taskTitle = this.title().trim();
    if (!taskTitle || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    this.canRetryLoad.set(false);
    this.taskService.createTask({ title: taskTitle }).subscribe({
      next: (task) => {
        this.tasks.update((tasks) => [task, ...tasks]);
        this.title.set('');
        this.saving.set(false);
      },
      error: (error: unknown) => {
        this.error.set(toUserFacingMessage(error));
        this.saving.set(false);
      },
    });
  }

  protected toggleTask(task: Task): void {
    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe({
      next: (updatedTask) => {
        this.tasks.update((tasks) =>
          tasks.map((item) => (item.id === updatedTask.id ? updatedTask : item)),
        );
      },
      error: (error: unknown) => {
        this.canRetryLoad.set(false);
        this.error.set(toUserFacingMessage(error));
      },
    });
  }

  protected deleteTask(task: Task): void {
    this.taskService.deleteTask(task.id).subscribe({
      next: () => this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id)),
      error: (error: unknown) => {
        this.canRetryLoad.set(false);
        this.error.set(toUserFacingMessage(error));
      },
    });
  }

  protected setFilter(filter: TaskFilter): void {
    this.filter.set(filter);
  }

  protected updateTitle(value: string): void {
    this.title.set(value);
  }
}
