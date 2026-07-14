import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeStellarNetworkId } from "@/lib/stellar/config";
import { submitRiskPublication } from "@/server/stellar/riskRegistry";
import { checkRateLimit } from "@/server/security/rateLimit";

const bodySchema = z.object({ network: z.string(), signedXdr: z.string().min(32).max(200_000) });
export async function POST(request: Request) {
  const limited = checkRateLimit(request, { namespace: "stellar:registry:submit", limit: 15, windowMs: 60_000 });
  if (limited) return limited;
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const network = normalizeStellarNetworkId(parsed.data.network);
  if (!network) return NextResponse.json({ error: "Unsupported Stellar network" }, { status: 400 });
  try { return NextResponse.json(await submitRiskPublication(network, parsed.data.signedXdr)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not submit registry transaction" }, { status: 502 }); }
}
