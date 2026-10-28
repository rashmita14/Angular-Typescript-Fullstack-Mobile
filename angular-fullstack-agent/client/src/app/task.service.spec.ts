import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach } from 'vitest';
import { TaskService } from './task.service';

describe('TaskService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('shares and caches task reads until a successful mutation invalidates the cache', () => {
    const service = TestBed.inject(TaskService);
    const controller = TestBed.inject(HttpTestingController);
    const task = {
      id: '0123456789abcdef01234567',
      title: 'Review API contract',
      completed: false,
      createdAt: '2026-10-27T00:00:00.000Z',
      updatedAt: '2026-10-27T00:00:00.000Z',
    };
    let firstRead: unknown;
    let cachedRead: unknown;

    service.getTasks().subscribe((value) => (firstRead = value));
    service.getTasks().subscribe((value) => (cachedRead = value));
    controller.expectOne('/api/tasks').flush([task]);

    expect(firstRead).toEqual([task]);
    expect(cachedRead).toEqual([task]);

    service.createTask({ title: 'Add generated API types' }).subscribe();
    controller.expectOne({
      method: 'POST',
      url: '/api/tasks',
    }).flush({ ...task, title: 'Add generated API types' });

    service.getTasks().subscribe();
    controller.expectOne('/api/tasks').flush([task]);
  });

  it('cancels the underlying HTTP request when its last subscriber unsubscribes', () => {
    const subscription = TestBed.inject(TaskService).getTasks().subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/tasks');

    subscription.unsubscribe();

    expect(request.cancelled).toBe(true);
  });
});
