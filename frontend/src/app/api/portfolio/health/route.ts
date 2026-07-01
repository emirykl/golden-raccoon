import { NextResponse } from "next/server";
import { apiCacheStrategy } from "@/server/cache/strategy";
import { getEnvHealth } from "@/server/env/validation";
import { getPortfolioProviderHealth } from "@/server/portfolio/getPortfolio";
import { getSecurityHealth } from "@/server/security/policy";
import { getStorageCounts, getStorageHealth } from "@/server/storage";

export async function GET() {
  return NextResponse.json({
    providers: getPortfolioProviderHealth(),
    env: getEnvHealth(),
    storage: getStorageHealth(),
    storageCounts: getStorageCounts(),
    security: getSecurityHealth(),
    cache: apiCacheStrategy,
    fallbackOrder: ["GoldRush/Covalent", "Alchemy", "GOAT RPC", "Mock portfolio"],
    checkedAt: new Date().toISOString(),
  });
}
