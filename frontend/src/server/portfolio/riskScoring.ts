import type { PortfolioSnapshot, TokenHolding, TokenSignal } from "../types";
import { clampScore, scoreToRiskLevel, weightedScore } from "@/server/agents/shared";
import { isVerifiedStablecoin } from "@/server/portfolio/tokenRegistry";

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

  return clampScore(weightedScore);
}

export function getRiskLevel(score: number): TokenHolding["riskLevel"] {
  return scoreToRiskLevel(score);
}

export type PortfolioRiskSignals = {
  concentrationRisk: number;
  stableReserveRisk: number;
  weightedHoldingRisk: number;
  largestHoldingPercent: number;
  top3HoldingPercent: number;
  top5HoldingPercent: number;
  stableReservePercent: number;
};

function sumAllocation(holdings: TokenHolding[]) {
  return holdings.reduce((total, holding) => total + holding.allocationPercent, 0);
}

export function getPortfolioRiskSignals(holdings: TokenHolding[]): PortfolioRiskSignals {
  const sortedByAllocation = [...holdings].sort((left, right) => right.allocationPercent - left.allocationPercent);
  const largestHoldingPercent = sortedByAllocation[0]?.allocationPercent ?? 0;
  const top3HoldingPercent = sumAllocation(sortedByAllocation.slice(0, 3));
  const top5HoldingPercent = sumAllocation(sortedByAllocation.slice(0, 5));
  const stableReservePercent = sumAllocation(holdings.filter((holding) => isVerifiedStablecoinHolding(holding)));
  const weightedHoldingRisk = getWeightedHoldingRisk(holdings);

  return {
    concentrationRisk: getConcentrationRisk(largestHoldingPercent, top3HoldingPercent, top5HoldingPercent),
    stableReserveRisk: getStableReserveRisk(stableReservePercent),
    weightedHoldingRisk,
    largestHoldingPercent,
    top3HoldingPercent,
    top5HoldingPercent,
    stableReservePercent,
  };
}

export function getConcentrationRisk(largestHoldingPercent: number, top3HoldingPercent: number, top5HoldingPercent: number) {
  if (largestHoldingPercent >= 60) return 92;
  if (largestHoldingPercent >= 40) return 72;
  if (top3HoldingPercent >= 80) return 66;
  if (top5HoldingPercent >= 90) return 54;
  if (largestHoldingPercent >= 25) return 38;

  return 18;
}

export function getStableReserveRisk(stableReservePercent: number) {
  if (stableReservePercent < 5) return 88;
  if (stableReservePercent < 15) return 70;
  if (stableReservePercent < 30) return 42;

  return 16;
}

function isVerifiedStablecoinHolding(holding: TokenHolding) {
  return isVerifiedStablecoin(holding.symbol, holding.chainId ?? holding.chainName, holding.tokenAddress);
}

function getWeightedHoldingRisk(holdings: TokenHolding[]): number {
  const total = holdings.reduce((sum, holding) => sum + holding.valueUsd, 0);

  if (total <= 0) {
    return 0;
  }

  const weightedRisk = holdings.reduce((sum, holding) => {
    return sum + holding.riskScore * (holding.valueUsd / total);
  }, 0);

  return clampScore(weightedRisk);
}

export function scorePortfolioRisk(holdings: TokenHolding[]): number {
  if (holdings.length === 0) {
    return 0;
  }

  const signals = getPortfolioRiskSignals(holdings);

  return weightedScore([
    { score: signals.concentrationRisk, weight: 0.3 },
    { score: signals.weightedHoldingRisk, weight: 0.6 },
    { score: signals.stableReserveRisk, weight: 0.1 },
  ]);
}

export function summarizePortfolioRisk(portfolio: PortfolioSnapshot): string {
  const riskiest = [...portfolio.holdings].sort((a, b) => b.riskScore - a.riskScore)[0];

  if (!riskiest) {
    return "No holdings detected for this wallet.";
  }

  return `${riskiest.symbol} is the main portfolio risk driver at ${riskiest.allocationPercent}% exposure with a ${riskiest.riskScore}/100 token risk score.`;
}
