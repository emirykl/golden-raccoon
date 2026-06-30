import type { UserRule } from "../types";

export function getDefaultRules(walletAddress = "0xDemoWallet"): UserRule {
  return {
    walletAddress,
    maxRiskScore: 80,
    maxTradePercent: 20,
    maxMemeExposurePercent: 10,
    autoExecute: false,
    createdAt: new Date().toISOString(),
  };
}
