import { z } from "zod";

export const prioritizedTaskSchema = z.object({
  rank: z.number().int().min(1),
  taskId: z.string(),
  title: z.string(),
  reason: z.string(),
  suggestedAction: z.string(),
});

export const prioritizationResultSchema = z.object({
  generatedAt: z.string(),
  summary: z.string(),
  agentSteps: z.array(z.string()).min(1),
  contextStats: z.object({
    totalTasks: z.number().int().min(0),
    actionableTasks: z.number().int().min(0),
    doneTasks: z.number().int().min(0),
    highPriorityTasks: z.number().int().min(0),
    staleTasks: z.number().int().min(0),
  }),
  recommendedTasks: z.array(prioritizedTaskSchema),
  reasoning: z.array(z.string()),
  risks: z.array(z.string()),
});

export type PrioritizationResult = z.infer<typeof prioritizationResultSchema>;
