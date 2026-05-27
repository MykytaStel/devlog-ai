import type { DecompositionResult, SubtaskDraft } from "./decomposition.types";
import type { PrioritizationResult } from "./prioritization.types";

type PrioritizationResponse = {
  data: PrioritizationResult;
};

type DecompositionResponse = {
  data: DecompositionResult;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : "AI request failed";

    throw new Error(message);
  }

  return data as T;
}

export async function runPrioritization(): Promise<PrioritizationResult> {
  const response = await fetch("/api/ai/prioritize", {
    method: "POST",
  });

  const result = await parseJsonResponse<PrioritizationResponse>(response);

  return result.data;
}

export async function runDecomposition(
  taskId: string
): Promise<DecompositionResult> {
  const response = await fetch("/api/ai/decompose", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ taskId }),
  });

  const result = await parseJsonResponse<DecompositionResponse>(response);

  return result.data;
}

export async function createGeneratedSubtasks(
  taskId: string,
  subtasks: SubtaskDraft[]
): Promise<void> {
  const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subtasks }),
  });

  await parseJsonResponse(response);
}
