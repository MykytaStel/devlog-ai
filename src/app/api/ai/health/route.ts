import { NextResponse } from "next/server";

import { getAiProvider } from "@/server/ai/get-ai-provider";

export const runtime = "nodejs";

export async function GET() {
  const provider = getAiProvider();

  return NextResponse.json({
    data: provider.health(),
  });
}
