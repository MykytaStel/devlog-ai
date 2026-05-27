import { NextResponse } from "next/server";

import { getAiProvider } from "@/server/ai/get-ai-provider";

export const runtime = "nodejs";

export async function POST() {
  const provider = getAiProvider();

  return NextResponse.json(
    {
      error: "Prioritization agent is not implemented yet",
      code: "AI_PRIORITIZATION_NOT_IMPLEMENTED",
      provider: provider.health(),
    },
    { status: 501 }
  );
}
