import { z } from "zod";

export const refineTaskResultSchema = z.object({
  title: z.string().describe("The refined, professional task title"),
  description: z.string().describe("The refined, structured task description with Problem, Solution, and Acceptance Criteria"),
  generatedAt: z.string().describe("ISO timestamp of generation"),
  agentSteps: z.array(z.string()).describe("A list of steps the agent took to refine this task"),
});

export type RefineTaskResult = z.infer<typeof refineTaskResultSchema>;
