import { NextRequest, NextResponse } from "next/server";
import { withCacheHeaders } from "@/server/cache/strategy";
import { checkRateLimit } from "@/server/security/rateLimit";
import { listApprovalRecords } from "@/server/storage";

export function GET(request: NextRequest) {
  const rateLimited = checkRateLimit(request, { namespace: "history:approvals", limit: 80, windowMs: 60_000 });

  if (rateLimited) {
    return rateLimited;
  }

  const walletAddress = request.nextUrl.searchParams.get("walletAddress") ?? undefined;

  return withCacheHeaders(NextResponse.json(listApprovalRecords(walletAddress)), "history");
}
