import { NextRequest, NextResponse } from "next/server";
import { withCacheHeaders } from "@/server/cache/strategy";
import { checkRateLimit } from "@/server/security/rateLimit";
import { listTransactionRecords } from "@/server/storage";

export function GET(request: NextRequest) {
  const rateLimited = checkRateLimit(request, { namespace: "transactions", limit: 80, windowMs: 60_000 });

  if (rateLimited) {
    return rateLimited;
  }

  const walletAddress = request.nextUrl.searchParams.get("walletAddress") ?? undefined;
  const records = listTransactionRecords(walletAddress);

  return withCacheHeaders(NextResponse.json(records), "transactions");
}
