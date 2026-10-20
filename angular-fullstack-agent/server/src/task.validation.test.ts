import assert from 'node:assert/strict';
import test from 'node:test';
import { createTaskSchema, updateTaskSchema } from './validation/task.validation.js';

test('create task trims a non-empty title', () => {
  assert.deepEqual(createTaskSchema.parse({ title: '  Plan the week  ' }), {
    title: 'Plan the week',
  });
});

test('create task rejects empty and oversized titles', () => {
  assert.equal(createTaskSchema.safeParse({ title: '  ' }).success, false);
  assert.equal(createTaskSchema.safeParse({ title: 'x'.repeat(161) }).success, false);
});

test('update task requires at least one allowed field', () => {
  assert.equal(updateTaskSchema.safeParse({}).success, false);
  assert.deepEqual(updateTaskSchema.parse({ completed: true }), { completed: true });
});

test('task schemas reject unexpected fields', () => {
  assert.equal(createTaskSchema.safeParse({ title: 'Read', admin: true }).success, false);
});
