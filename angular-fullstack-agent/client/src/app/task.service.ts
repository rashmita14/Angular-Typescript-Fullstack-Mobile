import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { CreateTaskPayload, Task, UpdateTaskPayload } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly tasksUrl = `${environment.apiUrl}/tasks`;

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.tasksUrl);
  }

  createTask(title: string): Observable<Task> {
    const payload: CreateTaskPayload = { title };
    return this.http.post<Task>(this.tasksUrl, payload);
  }

  updateTask(id: string, changes: UpdateTaskPayload): Observable<Task> {
    return this.http.patch<Task>(`${this.tasksUrl}/${encodeURIComponent(id)}`, changes);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.tasksUrl}/${encodeURIComponent(id)}`);
  }
}
