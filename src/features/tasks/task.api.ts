import {
  jsonRequestInit,
  parseJsonResponse,
} from "@/features/http/api-client";
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
    ...jsonRequestInit(input),
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
    ...jsonRequestInit(input),
  });

  const result = await parseJsonResponse<TaskResponse>(response);

  return result.data;
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });

  await parseJsonResponse<void>(response, "Failed to delete task");
}
