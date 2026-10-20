import { model, Schema } from 'mongoose';

export interface TaskRecord {
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<TaskRecord>(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 160 },
    completed: { type: Boolean, default: false, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const TaskModel = model<TaskRecord>('Task', taskSchema);
