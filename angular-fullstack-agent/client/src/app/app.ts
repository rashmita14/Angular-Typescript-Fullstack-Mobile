import { isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
      this.loadTasks();
    }
  }

  protected loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);
    this.canRetryLoad.set(false);
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not connect to the task API. Check that the server is running.');
        this.canRetryLoad.set(true);
        this.loading.set(false);
      },
    });
  }

  protected addTask(): void {
    const taskTitle = this.title().trim();
    if (!taskTitle || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    this.canRetryLoad.set(false);
    this.taskService.createTask(taskTitle).subscribe({
      next: (task) => {
        this.tasks.update((tasks) => [task, ...tasks]);
        this.title.set('');
        this.saving.set(false);
      },
      error: () => {
        this.error.set('Your task could not be saved. Please try again.');
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
      error: () => {
        this.canRetryLoad.set(false);
        this.error.set('The task could not be updated. Please try again.');
      },
    });
  }

  protected deleteTask(task: Task): void {
    this.taskService.deleteTask(task.id).subscribe({
      next: () => this.tasks.update((tasks) => tasks.filter((item) => item.id !== task.id)),
      error: () => {
        this.canRetryLoad.set(false);
        this.error.set('The task could not be deleted. Please try again.');
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
