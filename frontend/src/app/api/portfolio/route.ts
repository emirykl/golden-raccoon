import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getMockPortfolio } from "@/server/portfolio/mockPortfolio";

const querySchema = z.object({
  walletAddress: z.string().optional(),
});

export function GET(request: NextRequest) {
  const parsed = querySchema.safeParse({
    walletAddress: request.nextUrl.searchParams.get("walletAddress") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(getMockPortfolio(parsed.data.walletAddress));
}
