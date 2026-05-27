import type { NextRequest } from "next/server";

import { forbidden } from "./api-response";

export function requireSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "cross-site") {
    return forbidden("Cross-origin requests are not allowed");
  }

  if (!origin || !host) {
    return null;
  }

  try {
    if (new URL(origin).host === host) {
      return null;
    }
  } catch {
    return forbidden("Invalid origin");
  }

  return forbidden("Cross-origin requests are not allowed");
}
