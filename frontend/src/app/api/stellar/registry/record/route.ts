import { NextResponse } from "next/server";
import { normalizeStellarNetworkId } from "@/lib/stellar/config";
import { readRiskRecord } from "@/server/stellar/riskRegistry";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const network = normalizeStellarNetworkId(params.get("network") ?? undefined);
  const assetKey = params.get("assetKey")?.trim();
  if (!network || !assetKey || assetKey.length > 180) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try { return NextResponse.json({ record: await readRiskRecord(network, assetKey) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read risk record" }, { status: 502 }); }
}
