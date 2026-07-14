import { NextResponse } from "next/server";
import { normalizeStellarNetworkId } from "@/lib/stellar/config";
import { isTransactionHashForChain } from "@/lib/chainIdentity";
import { getRiskPublicationStatus } from "@/server/stellar/riskRegistry";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const network = normalizeStellarNetworkId(params.get("network") ?? undefined);
  const hash = params.get("hash") ?? "";
  if (!network || !isTransactionHashForChain(hash, "stellar")) return NextResponse.json({ error: "Invalid Stellar network or transaction hash" }, { status: 400 });
  try { return NextResponse.json(await getRiskPublicationStatus(network, hash)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read transaction status" }, { status: 502 }); }
}
