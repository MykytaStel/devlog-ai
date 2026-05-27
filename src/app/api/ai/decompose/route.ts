import { NextRequest } from "next/server";
import { z, ZodError } from "zod";

import { runDecompositionAgent } from "@/server/agents/decomposition-agent";
import { badRequest, ok, serverError, zodError } from "@/server/http/api-response";

export const runtime = "nodejs";

const requestSchema = z.object({
  taskId: z.string().min(1),
});

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJson(request);

    if (!body) {
      return badRequest("Invalid JSON body");
    }

    const input = requestSchema.parse(body);
    const result = await runDecompositionAgent(input);

    return ok({
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return zodError(error);
    }

    return serverError(error);
  }
}
