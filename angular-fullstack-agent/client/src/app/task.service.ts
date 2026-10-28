import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import type {
  CreateTask,
  CreateTaskResponse,
  DeleteTaskResponse,
  ListTasksResponse,
  UpdateTask,
  UpdateTaskResponse,
} from './api/generated';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly tasksUrl = `${environment.apiUrl}/tasks`;
  private tasksCache$: Observable<ListTasksResponse> | null = null;

  getTasks(): Observable<ListTasksResponse> {
    if (!this.tasksCache$) {
      let cachedRequest$: Observable<ListTasksResponse>;
      cachedRequest$ = this.http.get<ListTasksResponse>(this.tasksUrl).pipe(
        tap({
          error: () => {
            if (this.tasksCache$ === cachedRequest$) {
              this.tasksCache$ = null;
            }
          },
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
      this.tasksCache$ = cachedRequest$;
    }

    return this.tasksCache$;
  }

  invalidateTasks(): void {
    this.tasksCache$ = null;
  }

  createTask(payload: CreateTask): Observable<CreateTaskResponse> {
    return this.http.post<CreateTaskResponse>(this.tasksUrl, payload).pipe(
      tap(() => this.invalidateTasks()),
    );
  }

  updateTask(id: string, changes: UpdateTask): Observable<UpdateTaskResponse> {
    return this.http
      .patch<UpdateTaskResponse>(`${this.tasksUrl}/${encodeURIComponent(id)}`, changes)
      .pipe(tap(() => this.invalidateTasks()));
  }

  deleteTask(id: string): Observable<DeleteTaskResponse> {
    return this.http
      .delete<DeleteTaskResponse>(`${this.tasksUrl}/${encodeURIComponent(id)}`)
      .pipe(tap(() => this.invalidateTasks()));
  }
}
