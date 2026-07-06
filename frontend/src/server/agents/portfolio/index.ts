import type { AgentResult, AgentSource, PortfolioSnapshot } from "@/server/types";
import { getPortfolioProviderHealth, getPortfolioSnapshot, type PortfolioSnapshotSource } from "@/server/portfolio/getPortfolio";
import { buildAgentResult } from "@/server/agents/shared";
import { getPortfolioRiskSignals } from "@/server/portfolio/riskScoring";
import { getKnownTokenClass, isVerifiedStablecoin } from "@/server/portfolio/tokenRegistry";

function getProviderSources(): AgentSource[] {
  const health = getPortfolioProviderHealth();
  const checkedAt = new Date().toISOString();

  return [
    {
      label: "GoldRush/Covalent",
      status: health.goldRush.configured ? "connected" : "unavailable",
      detail: health.goldRush.detail,
      checkedAt,
      reliability: health.goldRush.configured ? 0.82 : 0.1,
    },
    {
      label: "Alchemy",
      status: health.alchemy.configured ? "connected" : "unavailable",
      detail: health.alchemy.detail,
      checkedAt,
      reliability: health.alchemy.configured ? 0.74 : 0.1,
    },
    {
      label: "GOAT RPC",
      status: health.goatRpc.configured ? "connected" : "unavailable",
      detail: health.goatRpc.detail,
      checkedAt,
      reliability: health.goatRpc.configured ? 0.7 : 0.1,
    },
  ];
}

function analyzePortfolioSnapshot(portfolio: PortfolioSnapshot, source: PortfolioSnapshotSource): AgentResult {
  if (portfolio.holdings.length === 0) {
    return buildAgentResult({
      agent: "portfolio",
      score: 58,
      verdict: "Portfolio source unavailable",
      summary: "Portfolio Agent could not read live wallet holdings. No mock holdings were generated.",
      findings: [
        {
          label: "Live portfolio unavailable",
          severity: "medium",
          detail: source.detail,
          sourceLabel: "Wallet portfolio API",
          raw: "No holding rows returned from configured portfolio providers.",
          interpretation: "Connect a supported wallet or configure a live portfolio provider before making allocation decisions.",
        },
      ],
      sources: [
        {
          label: "Wallet portfolio API",
          status: "unavailable",
          detail: `${source.detail} Snapshot for ${portfolio.walletAddress}.`,
        },
        ...getProviderSources(),
      ],
      confidence: 0.18,
      recommendedAction: "manual_review",
    });
  }

  const largestHolding = portfolio.holdings.reduce((largest, holding) =>
    holding.allocationPercent > largest.allocationPercent ? holding : largest
  );
  const riskSignals = getPortfolioRiskSignals(portfolio.holdings);
  const stablecoinRatio = portfolio.holdings
    .filter((holding) => isVerifiedStablecoin(holding.symbol, holding.chainId ?? holding.chainName, holding.tokenAddress))
    .reduce((total, holding) => total + holding.allocationPercent, 0);
  const memeExposure = portfolio.holdings
    .filter((holding) => getKnownTokenClass(holding.symbol) === "meme" || holding.symbol.toUpperCase().includes("MEME"))
    .reduce((total, holding) => total + holding.allocationPercent, 0);
  const unknownExposure = portfolio.holdings
    .filter((holding) => !holding.isVerified)
    .reduce((total, holding) => total + holding.allocationPercent, 0);
  const volatileExposure = portfolio.holdings
    .filter((holding) => Math.abs(holding.dayChangePercent ?? 0) >= 10)
    .reduce((total, holding) => total + holding.allocationPercent, 0);
  const lowLiquidityExposure = portfolio.holdings
    .filter((holding) => holding.signals.liquidityRisk >= 70)
    .reduce((total, holding) => total + holding.allocationPercent, 0);

  return buildAgentResult({
    agent: "portfolio",
    score: portfolio.riskScore,
    verdict: portfolio.riskScore >= 75 ? "Critical portfolio risk" : portfolio.riskScore >= 50 ? "High portfolio risk" : "Portfolio within monitoring range",
    summary: `${largestHolding.symbol} is the largest position at ${largestHolding.allocationPercent.toFixed(1)}%. Stablecoin reserve is ${stablecoinRatio.toFixed(1)}%.`,
    findings: [
      {
        label: "Largest holding",
        severity: riskSignals.largestHoldingPercent >= 60 ? "critical" : riskSignals.largestHoldingPercent >= 40 ? "high" : "medium",
        scoreImpact: riskSignals.concentrationRisk,
        detail: `${largestHolding.symbol} represents ${largestHolding.allocationPercent.toFixed(1)}% of the wallet. Top 3 holdings represent ${riskSignals.top3HoldingPercent.toFixed(1)}%.`,
        raw: JSON.stringify({
          largestHoldingPercent: riskSignals.largestHoldingPercent,
          top3HoldingPercent: riskSignals.top3HoldingPercent,
          top5HoldingPercent: riskSignals.top5HoldingPercent,
        }),
        interpretation:
          riskSignals.largestHoldingPercent >= 60
            ? "A single asset above 60% creates critical concentration exposure."
            : riskSignals.largestHoldingPercent >= 40
              ? "A single asset above 40% creates high concentration exposure."
              : "Concentration is within the current monitoring range.",
      },
      {
        label: "Stablecoin reserve",
        severity: stablecoinRatio < 5 ? "critical" : stablecoinRatio < 15 ? "high" : stablecoinRatio < 30 ? "medium" : "low",
        scoreImpact: riskSignals.stableReserveRisk,
        detail: `Verified stablecoin reserve is ${stablecoinRatio.toFixed(1)}% of portfolio value.`,
        raw: JSON.stringify({ stableReservePercent: stablecoinRatio }),
        interpretation:
          stablecoinRatio < 5
            ? "Stable reserve below 5% leaves the wallet highly exposed during drawdowns."
            : stablecoinRatio < 15
              ? "Stable reserve below 15% limits defensive flexibility."
              : "Stable reserve is present and reduces downside exposure.",
      },
      {
        label: "Meme exposure",
        severity: memeExposure > 20 ? "high" : "medium",
        detail: `Meme exposure is ${memeExposure.toFixed(1)}% across tracked holdings.`,
      },
      {
        label: "Unknown tokens",
        severity: unknownExposure > 15 ? "high" : "low",
        detail: `Unverified token exposure is ${unknownExposure.toFixed(1)}%.`,
      },
      {
        label: "Volatility",
        severity: volatileExposure > 20 ? "high" : "low",
        detail: `${volatileExposure.toFixed(1)}% of the portfolio moved 10% or more in 24h.`,
      },
      {
        label: "Liquidity risk",
        severity: lowLiquidityExposure > 20 ? "high" : "low",
        detail: `${lowLiquidityExposure.toFixed(1)}% of holdings carry elevated liquidity risk.`,
      },
    ],
    sources: [
      {
        label: "Wallet portfolio API",
        status: source.status,
        detail: `${source.detail} Snapshot for ${portfolio.walletAddress}.`,
      },
      ...getProviderSources(),
    ],
    confidence: source.status === "connected" ? 0.76 : 0.58,
    recommendedAction: portfolio.riskScore >= 75 ? "swap_to_stable" : portfolio.riskScore >= 50 ? "reduce_exposure" : "watch",
    rawSignals: {
      portfolioRisk: riskSignals,
      stablecoinRatio,
      memeExposure,
      unknownExposure,
      volatileExposure,
      lowLiquidityExposure,
    },
  });
}

export async function runPortfolioAgent(walletAddress?: string): Promise<AgentResult> {
  const { portfolio, source } = await getPortfolioSnapshot(walletAddress);

  return analyzePortfolioSnapshot(portfolio, source);
}
