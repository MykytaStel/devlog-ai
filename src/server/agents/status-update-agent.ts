import { statusUpdateResultSchema, type StatusUpdateResult } from "@/features/ai/status.types";
import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTasks } from "@/server/repositories/task.repository";

function buildFallbackStatus(tasksCount: number): StatusUpdateResult {
  return {
    updateText: `*Daily Async Update*\n\nHey team! 👋\n\nI'm currently tracking ${tasksCount} active/completed tasks in my DevLog.\n\n*Progress:*\n- Continuing work on prioritized items.\n- Let me know if anyone is blocked!\n\n_Generated via Mock Provider_`,
    generatedAt: new Date().toISOString(),
    agentSteps: [
      "Loaded all active tasks from the repository.",
      "Analyzed task statuses and recent progress.",
      "Generated a structured Slack-friendly update.",
      "Returned mock data (AI provider is set to mock mode)."
    ],
  };
}

function buildUserPrompt(tasks: Array<{ title: string; status: string; priority: string; }>) {
  return [
    "You are an assistant helping an engineer write their daily async status update for Slack/Teams.",
    "Below is the list of their tasks.",
    "Please generate a concise, friendly, and professional status update summarizing what they are working on (in-progress) and what they have finished (done).",
    "Keep it brief. Use bullet points.",
    "If there are no tasks, just say 'No updates for today.'",
    "",
    "Tasks Data:",
    JSON.stringify(tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority })), null, 2),
  ].join("\n");
}

export async function runStatusUpdateAgent(): Promise<StatusUpdateResult> {
  const tasks = await getTasks({ status: "all", sort: "createdAt" });
  
  // Filter relevant tasks: always include in-progress; include done only if
  // updated within the last 48 hours so the standup doesn't mention stale work.
  const cutoffMs = Date.now() - 48 * 60 * 60 * 1000;
  const relevantTasks = tasks.filter((t) => {
    if (t.status === "in-progress") return true;
    if (t.status === "done") {
      return new Date(t.updatedAt).getTime() >= cutoffMs;
    }
    return false;
  });

  const fallback = buildFallbackStatus(relevantTasks.length);
  const provider = getAiProvider();

  const result = await provider.generateJson({
    schemaName: "StatusUpdateResult",
    schema: statusUpdateResultSchema,
    mockResponse: fallback,
    system: [
      "You are a professional engineering status update generator.",
      "You read a list of tasks and produce a Slack-friendly daily standup message.",
      "You do not invent tasks that are not in the list.",
    ].join("\n"),
    user: buildUserPrompt(relevantTasks),
  });

  return {
    ...result,
    generatedAt: new Date().toISOString(),
  };
}
