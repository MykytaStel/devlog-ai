import { NextRequest } from "next/server";
import { z } from "zod";

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
  routeError,
} from "@/server/http/api-response";
import { readJsonBody } from "@/server/http/read-json";
import { requireSameOrigin } from "@/server/http/request-guard";

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

export async function POST(request: NextRequest, context: RouteContext) {
  const originError = requireSameOrigin(request);

  if (originError) {
    return originError;
  }

  try {
    const id = await getTaskId(context);
    const existingTask = await getTaskById(id);

    if (!existingTask) {
      return notFound("Task not found");
    }

    const body = await readJsonBody(request);

    if (!body) {
      return badRequest("Invalid JSON body");
    }

    const input = createSubtasksSchema.parse(body);
    const task = await createSubtasks(id, input.subtasks);

    if (!task) {
      return notFound("Task not found");
    }

    return created({
      data: task,
    });
  } catch (error) {
    return routeError(error);
  }
}
