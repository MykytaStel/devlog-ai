import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Decomposition agent is not implemented yet",
      code: "AI_DECOMPOSITION_NOT_IMPLEMENTED",
    },
    { status: 501 }
  );
}
