import type { PrioritizationResult } from "./prioritization.types";

type PrioritizationResponse = {
  data: PrioritizationResult;
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
