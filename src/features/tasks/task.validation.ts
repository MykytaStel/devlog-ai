import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES } from "./task.types";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().min(1, "Description is required").max(2000),
  status: z.enum(TASK_STATUSES).default("todo"),
  priority: z.enum(TASK_PRIORITIES).default("medium"),
  parentId: z.string().nullable().optional(),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const taskQuerySchema = z.object({
  status: z.enum([...TASK_STATUSES, "all"] as const).default("all"),
  sort: z.enum(["createdAt", "priority"]).default("createdAt"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;