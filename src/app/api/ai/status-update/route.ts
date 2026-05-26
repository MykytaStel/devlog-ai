import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Status update agent is not implemented yet",
      code: "AI_STATUS_UPDATE_NOT_IMPLEMENTED",
    },
    { status: 501 }
  );
}
