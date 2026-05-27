import { z } from "zod";

export const statusUpdateResultSchema = z.object({
  updateText: z.string().describe("The generated status update text in markdown format, suitable for Slack/Teams."),
  generatedAt: z.string().describe("ISO timestamp of when the update was generated"),
  agentSteps: z.array(z.string()).describe("A list of steps the agent took to generate this update"),
});

export type StatusUpdateResult = z.infer<typeof statusUpdateResultSchema>;
