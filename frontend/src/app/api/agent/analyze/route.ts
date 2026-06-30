import { NextResponse } from "next/server";
import { z } from "zod";
import { runGoldRaccoonAgent } from "@/server/agent";
import { getMockPortfolio } from "@/server/portfolio/mockPortfolio";

const bodySchema = z.object({
  walletAddress: z.string().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const portfolio = getMockPortfolio(parsed.data.walletAddress);
  return NextResponse.json(runGoldRaccoonAgent(portfolio));
}
