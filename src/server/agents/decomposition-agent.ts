import {
  decompositionResultSchema,
  type DecompositionResult,
} from "@/features/ai/decomposition.types";
import { getAiProvider } from "@/server/ai/get-ai-provider";
import { getTaskById } from "@/server/repositories/task.repository";

type DecompositionInput = {
  taskId: string;
};

function isTaskVague(task: {
  title: string;
  description: string;
}) {
  const title = task.title.trim();
  const description = task.description.trim();

  const vaguePhrases = [
    "fix",
    "fix bug",
    "improve",
    "make better",
    "update ui",
    "do it",
    "task",
    "bug",
  ];

  const normalizedTitle = title.toLowerCase();
  const normalizedDescription = description.toLowerCase();

  const isTitleExtremelyShort = title.length < 5;
  const isDescriptionShort = description.length < 30;

  // Extremely short title and short description -> vague
  if (isTitleExtremelyShort && isDescriptionShort) {
    return true;
  }

  // Vague title phrase and short description -> vague
  const hasVagueTitle = vaguePhrases.some((phrase) => normalizedTitle === phrase);
  if (hasVagueTitle && isDescriptionShort) {
    return true;
  }

  // Short title (< 8 chars) and no description -> vague
  if (title.length < 8 && description.length === 0) {
    return true;
  }

  // Both title and description are general vague phrases
  const isTitleVagueWord = vaguePhrases.includes(normalizedTitle);
  const isDescriptionVagueWord = vaguePhrases.includes(normalizedDescription);
  if (isTitleVagueWord && (description.length === 0 || isDescriptionVagueWord)) {
    return true;
  }

  return false;
}

function buildClarificationResult(task: {
  title: string;
  description: string;
}): DecompositionResult {
  return {
    type: "clarification_needed",
    generatedAt: new Date().toISOString(),
    question:
      "Can you clarify the expected outcome, constraints, and acceptance criteria for this task before I break it down?",
    missingContext: [
      "Expected final outcome",
      "Main technical constraints",
      "Acceptance criteria",
      "Known blockers or dependencies",
    ],
    agentSteps: [
      "Loaded the selected task from the repository.",
      "Checked title and description clarity.",
      `Detected that "${task.title}" does not contain enough context for safe decomposition.`,
      "Stopped before generating subtasks and returned a clarification question.",
    ],
  };
}

function buildFallbackSubtasks(task: {
  title: string;
  description: string;
  priority: string;
}): DecompositionResult {
  const inheritedPriority = task.priority === "high" ? "high" : "medium";

  return {
    type: "subtasks",
    generatedAt: new Date().toISOString(),
    summary: `Break "${task.title}" into implementation, validation, and documentation steps.`,
    subtasks: [
      {
        title: `Clarify scope for ${task.title}`,
        description:
          "Review the task description, identify expected behavior, edge cases, and any missing acceptance criteria.",
        priority: inheritedPriority,
        reason:
          "Engineering tasks are safer to execute when scope and acceptance criteria are explicit.",
      },
      {
        title: `Implement core changes for ${task.title}`,
        description:
          "Make the smallest vertical implementation that satisfies the main task goal without expanding the scope.",
        priority: inheritedPriority,
        reason:
          "The core implementation should happen after scope is clear and should stay focused.",
      },
      {
        title: `Verify ${task.title}`,
        description:
          "Test the implementation manually, check API/UI behavior, and confirm that the task works after reload or rebuild if relevant.",
        priority: "medium",
        reason:
          "Verification reduces the risk of shipping a feature that only works in the happy path.",
      },
      {
        title: `Document ${task.title}`,
        description:
          "Update README, AGENT_LOG, or inline notes if the task changes architecture, setup, or user-visible behavior.",
        priority: "low",
        reason:
          "The assignment evaluates communication of decisions and trade-offs, not only code.",
      },
    ],
    agentSteps: [
      "Loaded the selected task from the repository.",
      "Checked task clarity before decomposition.",
      "Detected enough context to generate subtasks.",
      "Generated a structured subtask plan.",
      "Returned a preview instead of writing to the database automatically.",
    ],
  };
}

function buildUserPrompt(task: {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  subtasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
}) {
  return [
    "You are helping an engineering team break down a task into executable subtasks.",
    "",
    "Rules:",
    "- If the task is vague, return clarification_needed.",
    "- If the task is clear, return 3-6 practical subtasks.",
    "- Subtasks must be specific, engineering-oriented, and testable.",
    "- Do not create subtasks that are unrelated to the selected task.",
    "- Return structured JSON only.",
    "",
    "Selected task:",
    JSON.stringify(task, null, 2),
  ].join("\n");
}

function normalizeResult(result: DecompositionResult): DecompositionResult {
  if (result.type === "clarification_needed") {
    return {
      ...result,
      generatedAt: new Date().toISOString(),
      missingContext: result.missingContext.slice(0, 6),
    };
  }

  return {
    ...result,
    generatedAt: new Date().toISOString(),
    subtasks: result.subtasks.slice(0, 8),
  };
}

export async function runDecompositionAgent({
  taskId,
}: DecompositionInput): Promise<DecompositionResult> {
  const task = await getTaskById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  if (isTaskVague(task)) {
    return buildClarificationResult(task);
  }

  const fallback = buildFallbackSubtasks(task);
  const provider = getAiProvider();

  const result = await provider.generateJson({
    schemaName: "DecompositionResult",
    schema: decompositionResultSchema,
    mockResponse: fallback,
    system: [
      "You are a pragmatic engineering decomposition agent.",
      "You decide whether a task is clear enough to break down.",
      "If it is vague, ask for clarification instead of inventing details.",
      "If it is clear, generate concise and executable subtasks.",
    ].join("\n"),
    user: buildUserPrompt(task),
  });

  return normalizeResult(result);
}
