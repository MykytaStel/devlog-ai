import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Prioritization agent is not implemented yet",
      code: "AI_PRIORITIZATION_NOT_IMPLEMENTED",
    },
    { status: 501 }
  );
}
