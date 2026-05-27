import { NextRequest } from "next/server";

import {
  createTaskSchema,
  taskQuerySchema,
} from "@/features/tasks/task.validation";
import { createTask, getTasks } from "@/server/repositories/task.repository";
import { badRequest, created, ok, routeError } from "@/server/http/api-response";
import { readJsonBody } from "@/server/http/read-json";
import { requireSameOrigin } from "@/server/http/request-guard";

export async function GET(request: NextRequest) {
  try {
    const query = taskQuerySchema.parse({
      status: request.nextUrl.searchParams.get("status") ?? undefined,
      sort: request.nextUrl.searchParams.get("sort") ?? undefined,
    });

    const tasks = await getTasks(query);

    return ok({
      data: tasks,
      meta: {
        count: tasks.length,
        status: query.status,
        sort: query.sort,
      },
    });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);

  if (originError) {
    return originError;
  }

  try {
    const body = await readJsonBody(request);

    if (!body) {
      return badRequest("Invalid JSON body");
    }

    const input = createTaskSchema.parse(body);
    const task = await createTask(input);

    return created({
      data: task,
    });
  } catch (error) {
    return routeError(error);
  }
}
