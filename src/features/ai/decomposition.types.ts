import { z } from "zod";

export const subtaskDraftSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
  priority: z.enum(["low", "medium", "high"]),
  reason: z.string().min(1).max(500),
});

export const decompositionResultSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("clarification_needed"),
    generatedAt: z.string(),
    question: z.string().min(1),
    missingContext: z.array(z.string()),
    agentSteps: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal("subtasks"),
    generatedAt: z.string(),
    summary: z.string().min(1),
    subtasks: z.array(subtaskDraftSchema).min(1).max(8),
    agentSteps: z.array(z.string()).min(1),
  }),
]);

export type SubtaskDraft = z.infer<typeof subtaskDraftSchema>;
export type DecompositionResult = z.infer<typeof decompositionResultSchema>;
