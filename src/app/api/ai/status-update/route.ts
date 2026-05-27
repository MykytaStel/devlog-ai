import { NextRequest, NextResponse } from "next/server";

import { getAiProvider } from "@/server/ai/get-ai-provider";
import { requireSameOrigin } from "@/server/http/request-guard";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);

  if (originError) {
    return originError;
  }

  const provider = getAiProvider();

  return NextResponse.json(
    {
      error: "Status update agent is not implemented yet",
      code: "AI_STATUS_UPDATE_NOT_IMPLEMENTED",
      provider: provider.health(),
    },
    { status: 501 }
  );
}
