import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDefaultRules } from "@/server/rules/defaultRules";

const ruleSchema = z.object({
  walletAddress: z.string().min(1),
  maxRiskScore: z.number().min(0).max(100),
  maxTradePercent: z.number().min(0).max(100),
  maxMemeExposurePercent: z.number().min(0).max(100),
  autoExecute: z.boolean(),
  createdAt: z.string().optional(),
});

export function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get("walletAddress") ?? undefined;
  return NextResponse.json(getDefaultRules(walletAddress));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = ruleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    ...parsed.data,
    createdAt: parsed.data.createdAt ?? new Date().toISOString(),
  });
}
