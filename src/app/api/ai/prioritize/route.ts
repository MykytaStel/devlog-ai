import { ok, serverError } from "@/server/http/api-response";
import { runPrioritizationAgent } from "@/server/agents/prioritization-agent";

export const runtime = "nodejs";

export async function POST() {
  try {
    const result = await runPrioritizationAgent();

    return ok({
      data: result,
    });
  } catch (error) {
    return serverError(error);
  }
}
