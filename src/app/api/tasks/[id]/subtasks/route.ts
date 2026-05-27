import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

import { subtaskDraftSchema } from "@/features/ai/decomposition.types";
import { TASK_PRIORITIES } from "@/features/tasks/task.types";
import {
  createSubtasks,
  getTaskById,
} from "@/server/repositories/task.repository";
import {
  badRequest,
  created,
  notFound,
  serverError,
  zodError,
} from "@/server/http/api-response";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const createSubtasksSchema = z.object({
  subtasks: z.array(
    subtaskDraftSchema.extend({
      priority: z.enum(TASK_PRIORITIES),
    })
  ).min(1).max(8),
});

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

export async function POST(request: NextRequest, context: RouteContext) {
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

    const input = createSubtasksSchema.parse(body);
    const task = await createSubtasks(id, input.subtasks);

    return created({
      data: task,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodError(error);
    }

    return serverError(error);
  }
}
