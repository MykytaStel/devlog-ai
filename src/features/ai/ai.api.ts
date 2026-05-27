import {
  jsonRequestInit,
  parseJsonResponse,
} from "@/features/http/api-client";
import type { TaskWithSubtasksDto } from "@/features/tasks/task.types";
import type { DecompositionResult, SubtaskDraft } from "./decomposition.types";
import type { PrioritizationResult } from "./prioritization.types";

type PrioritizationResponse = {
  data: PrioritizationResult;
};

type DecompositionResponse = {
  data: DecompositionResult;
};

type CreateSubtasksResponse = {
  data: TaskWithSubtasksDto;
};

export async function runPrioritization(): Promise<PrioritizationResult> {
  const response = await fetch("/api/ai/prioritize", {
    method: "POST",
  });

  const result = await parseJsonResponse<PrioritizationResponse>(
    response,
    "AI request failed"
  );

  return result.data;
}

export async function runDecomposition(
  taskId: string
): Promise<DecompositionResult> {
  const response = await fetch("/api/ai/decompose", {
    method: "POST",
    ...jsonRequestInit({ taskId }),
  });

  const result = await parseJsonResponse<DecompositionResponse>(
    response,
    "AI request failed"
  );

  return result.data;
}

export async function createGeneratedSubtasks(
  taskId: string,
  subtasks: SubtaskDraft[]
): Promise<TaskWithSubtasksDto> {
  const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
    method: "POST",
    ...jsonRequestInit({ subtasks }),
  });

  const result = await parseJsonResponse<CreateSubtasksResponse>(
    response,
    "AI request failed"
  );

  return result.data;
}
