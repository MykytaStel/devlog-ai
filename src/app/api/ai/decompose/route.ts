import { NextRequest } from "next/server";
import { z } from "zod";

import { runDecompositionAgent } from "@/server/agents/decomposition-agent";
import { badRequest, ok, routeError } from "@/server/http/api-response";
import { readJsonBody } from "@/server/http/read-json";
import { requireSameOrigin } from "@/server/http/request-guard";

export const runtime = "nodejs";

const requestSchema = z.object({
  taskId: z.string().min(1),
});

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

    const input = requestSchema.parse(body);
    const result = await runDecompositionAgent(input);

    return ok({
      data: result,
    });
  } catch (error) {
    return routeError(error);
  }
}
