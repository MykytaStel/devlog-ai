import { NextRequest } from "next/server";
import { ZodError } from "zod";

import { updateTaskSchema } from "@/features/tasks/task.validation";
import {
  deleteTask,
  getTaskById,
  updateTask,
} from "@/server/repositories/task.repository";
import {
  badRequest,
  noContent,
  notFound,
  ok,
  serverError,
  zodError,
} from "@/server/http/api-response";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function getTaskId(context: RouteContext) {
  const params = await context.params;
  return params.id;
}

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const id = await getTaskId(context);
    const task = await getTaskById(id);

    if (!task) {
      return notFound("Task not found");
    }

    return ok({
      data: task,
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const id = await getTaskId(context);

    const existingTask = await getTaskById(id);

    if (!existingTask) {
      return notFound("Task not found");
    }

    const body = await readJson(request);

    if (!body) {
      return badRequest("Invalid JSON body");
    }

    const input = updateTaskSchema.parse(body);
    const task = await updateTask(id, input);

    return ok({
      data: task,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodError(error);
    }

    return serverError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const id = await getTaskId(context);

    const existingTask = await getTaskById(id);

    if (!existingTask) {
      return notFound("Task not found");
    }

    await deleteTask(id);

    return noContent();
  } catch (error) {
    return serverError(error);
  }
}