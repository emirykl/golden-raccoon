import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withCacheHeaders } from "@/server/cache/strategy";
import { getPortfolioSnapshot } from "@/server/portfolio/getPortfolio";
import { checkRateLimit } from "@/server/security/rateLimit";
import { anyWalletAddressSchema, chainIdSchema, validateWalletAddressForChain } from "@/server/security/inputValidation";

const querySchema = z.object({
  walletAddress: anyWalletAddressSchema,
  chain: chainIdSchema,
}).superRefine((value, context) => {
  if (!validateWalletAddressForChain(value.walletAddress, value.chain)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["walletAddress"], message: "Wallet address does not match the selected chain" });
  }
});

export async function GET(request: NextRequest) {
  const rateLimited = checkRateLimit(request, { namespace: "portfolio", limit: 60, windowMs: 60_000 });

  if (rateLimited) {
    return rateLimited;
  }

  const parsed = querySchema.safeParse({
    walletAddress: request.nextUrl.searchParams.get("walletAddress") ?? undefined,
    chain: request.nextUrl.searchParams.get("chain") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { portfolio } = await getPortfolioSnapshot(parsed.data.walletAddress, parsed.data.chain);

  return withCacheHeaders(NextResponse.json(portfolio), "portfolio");
}
