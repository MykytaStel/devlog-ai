import { NextRequest } from "next/server";

import { ok, routeError } from "@/server/http/api-response";
import { requireSameOrigin } from "@/server/http/request-guard";
import { runPrioritizationAgent } from "@/server/agents/prioritization-agent";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);

  if (originError) {
    return originError;
  }

  try {
    const result = await runPrioritizationAgent();

    return ok({
      data: result,
    });
  } catch (error) {
    return routeError(error);
  }
}
