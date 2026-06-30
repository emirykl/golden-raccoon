import type { PortfolioSnapshot, TokenHolding, TokenSignal } from "../types";

const weights: Record<keyof TokenSignal, number> = {
  scamRisk: 0.16,
  websiteTrustRisk: 0.09,
  contractRisk: 0.13,
  whaleSellRisk: 0.13,
  liquidityRisk: 0.12,
  xSentimentRisk: 0.09,
  holderConcentrationRisk: 0.11,
  priceVolatilityRisk: 0.07,
  portfolioExposureRisk: 0.1,
};

export function scoreTokenRisk(signals: TokenSignal): number {
  const weightedScore = Object.entries(weights).reduce((score, [key, weight]) => {
    return score + signals[key as keyof TokenSignal] * weight;
  }, 0);

  return Math.round(Math.min(100, Math.max(0, weightedScore)));
}

export function getRiskLevel(score: number): TokenHolding["riskLevel"] {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function scorePortfolioRisk(holdings: TokenHolding[]): number {
  const total = holdings.reduce((sum, holding) => sum + holding.valueUsd, 0);

  if (total <= 0) {
    return 0;
  }

  const weightedRisk = holdings.reduce((sum, holding) => {
    return sum + holding.riskScore * (holding.valueUsd / total);
  }, 0);

  return Math.round(weightedRisk);
}

export function summarizePortfolioRisk(portfolio: PortfolioSnapshot): string {
  const riskiest = [...portfolio.holdings].sort((a, b) => b.riskScore - a.riskScore)[0];

  if (!riskiest) {
    return "No holdings detected for this wallet.";
  }

  return `${riskiest.symbol} is the main portfolio risk driver at ${riskiest.allocationPercent}% exposure with a ${riskiest.riskScore}/100 token risk score.`;
}
