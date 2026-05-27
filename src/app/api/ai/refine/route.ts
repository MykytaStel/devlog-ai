import { runRefineAgent } from "@/server/agents/refine-agent";
import { requireSameOrigin } from "@/server/http/request-guard";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const refineInputSchema = z.object({
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

export async function POST(request: NextRequest) {
  const originCheck = requireSameOrigin(request);
  if (originCheck) return originCheck;

  try {
    const json = await request.json();
    const input = refineInputSchema.parse(json);

    const result = await runRefineAgent(input);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[POST /api/ai/refine]", error);
    return NextResponse.json(
      { error: "Failed to refine task." },
      { status: 500 }
    );
  }
}
