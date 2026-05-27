import type { Task } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import {
  isTaskPriority,
  isTaskStatus,
  type TaskDto,
  type TaskPriority,
  type TaskWithSubtasksDto,
} from "@/features/tasks/task.types";
import type {
  CreateTaskInput,
  TaskQueryInput,
  UpdateTaskInput,
} from "@/features/tasks/task.validation";

const priorityRank: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function parseTaskStatus(status: string) {
  if (!isTaskStatus(status)) {
    throw new Error(`Invalid task status stored in database: ${status}`);
  }

  return status;
}

function parseTaskPriority(priority: string) {
  if (!isTaskPriority(priority)) {
    throw new Error(`Invalid task priority stored in database: ${priority}`);
  }

  return priority;
}

function mapTask(task: Task): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: parseTaskStatus(task.status),
    priority: parseTaskPriority(task.priority),
    parentId: task.parentId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function getTasks(query: TaskQueryInput): Promise<TaskDto[]> {
  const tasks = await prisma.task.findMany({
    where:
      query.status === "all"
        ? undefined
        : {
            status: query.status,
          },
    orderBy:
      query.sort === "createdAt"
        ? {
            createdAt: "desc",
          }
        : undefined,
  });

  const mapped = tasks.map(mapTask);

  if (query.sort === "priority") {
    return mapped.sort((a, b) => {
      return priorityRank[b.priority] - priorityRank[a.priority];
    });
  }

  return mapped;
}

export async function getTaskById(
  id: string
): Promise<TaskWithSubtasksDto | null> {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      subtasks: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!task) {
    return null;
  }

  return {
    ...mapTask(task),
    subtasks: task.subtasks.map(mapTask),
  };
}

export async function createTask(input: CreateTaskInput): Promise<TaskDto> {
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      parentId: input.parentId ?? null,
    },
  });

  return mapTask(task);
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput
): Promise<TaskDto> {
  const task = await prisma.task.update({
    where: { id },
    data: input,
  });

  return mapTask(task);
}

export async function deleteTask(id: string) {
  await prisma.task.delete({
    where: { id },
  });
}

export async function createSubtasks(
  parentId: string,
  subtasks: Array<{
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
  }>
): Promise<TaskWithSubtasksDto | null> {
  await prisma.task.createMany({
    data: subtasks.map((subtask) => ({
      title: subtask.title,
      description: subtask.description,
      priority: subtask.priority,
      status: "todo",
      parentId,
    })),
  });

  return getTaskById(parentId);
}
