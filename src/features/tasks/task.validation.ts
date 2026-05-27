import { z } from "zod";
import { TASK_PRIORITIES, TASK_STATUSES } from "./task.types";

const taskTitleSchema = z.string().trim().min(1, "Title is required").max(120);
const taskDescriptionSchema = z
  .string()
  .trim()
  .min(1, "Description is required")
  .max(2000);
const taskStatusSchema = z.enum(TASK_STATUSES);
const taskPrioritySchema = z.enum(TASK_PRIORITIES);
const taskParentIdSchema = z.string().nullable().optional();

export const createTaskSchema = z.object({
  title: taskTitleSchema,
  description: taskDescriptionSchema,
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  parentId: taskParentIdSchema,
});

export const updateTaskSchema = z
  .object({
    title: taskTitleSchema.optional(),
    description: taskDescriptionSchema.optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    parentId: taskParentIdSchema,
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "At least one field is required",
  });

export const taskQuerySchema = z.object({
  status: z.enum([...TASK_STATUSES, "all"] as const).default("all"),
  sort: z.enum(["createdAt", "priority"]).default("createdAt"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
