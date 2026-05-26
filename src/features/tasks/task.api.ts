import type { TaskDto, TaskPriority, TaskSort, TaskStatus } from "./task.types";

export type TaskListFilters = {
  status: TaskStatus | "all";
  sort: TaskSort;
};

export type TaskMutationInput = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  parentId?: string | null;
};

type TaskListResponse = {
  data: TaskDto[];
  meta: {
    count: number;
    status: TaskStatus | "all";
    sort: TaskSort;
  };
};

type TaskResponse = {
  data: TaskDto;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : "Request failed";

    throw new Error(message);
  }

  return data as T;
}

export async function fetchTasks(filters: TaskListFilters): Promise<TaskDto[]> {
  const params = new URLSearchParams({
    status: filters.status,
    sort: filters.sort,
  });

  const response = await fetch(`/api/tasks?${params.toString()}`, {
    cache: "no-store",
  });

  const result = await parseJsonResponse<TaskListResponse>(response);

  return result.data;
}

export async function createTask(input: TaskMutationInput): Promise<TaskDto> {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = await parseJsonResponse<TaskResponse>(response);

  return result.data;
}

export async function updateTask(
  id: string,
  input: Partial<TaskMutationInput>
): Promise<TaskDto> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const result = await parseJsonResponse<TaskResponse>(response);

  return result.data;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message =
      data && typeof data === "object" && "error" in data
        ? String(data.error)
        : "Failed to delete task";

    throw new Error(message);
  }
}
