import { runStatusUpdateAgent } from "@/server/agents/status-update-agent";
import { requireSameOrigin } from "@/server/http/request-guard";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request);
  if (originCheck) return originCheck;

  try {
    const result = await runStatusUpdateAgent();
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[POST /api/ai/status]", error);
    return NextResponse.json(
      { error: "Failed to generate status update." },
      { status: 500 }
    );
  }
}
