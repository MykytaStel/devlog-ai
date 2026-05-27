const jsonHeaders = {
  "Content-Type": "application/json",
} as const;

export function jsonRequestInit(body: unknown): Pick<RequestInit, "body" | "headers"> {
  return {
    headers: jsonHeaders,
    body: JSON.stringify(body),
  };
}

export async function parseJsonResponse<T>(
  response: Response,
  fallbackMessage = "Request failed"
): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : fallbackMessage;

    throw new Error(message);
  }

  return data as T;
}
