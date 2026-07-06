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

function severityFromScore(score: number) {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

function getRecommendedAction(portfolio: PortfolioSnapshot, riskSignals: ReturnType<typeof getPortfolioRiskSignals>) {
  if (riskSignals.stableReservePercent < 5 && riskSignals.highRiskExposurePercent >= 70) {
    return "manual_review";
  }

  if (portfolio.riskScore >= 75) {
    return "swap_to_stable";
  }

  if (portfolio.riskScore >= 50) {
    return "reduce_exposure";
  }

  return "watch";
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
  const topRiskHoldings = [...portfolio.holdings]
    .sort((left, right) => {
      const riskGap = right.riskScore - left.riskScore;

      return riskGap !== 0 ? riskGap : right.allocationPercent - left.allocationPercent;
    })
    .slice(0, 5)
    .map((holding) => ({
      symbol: holding.symbol,
      name: holding.name,
      riskScore: holding.riskScore,
      allocationPercent: holding.allocationPercent,
      valueUsd: holding.valueUsd,
      chain: holding.chainName ?? holding.chainId,
    }));
  const recommendedAction = getRecommendedAction(portfolio, riskSignals);

  return buildAgentResult({
    agent: "portfolio",
    score: portfolio.riskScore,
    verdict: portfolio.riskScore >= 75 ? "Critical portfolio risk" : portfolio.riskScore >= 50 ? "High portfolio risk" : "Portfolio within monitoring range",
    summary: `${largestHolding.symbol} is ${largestHolding.allocationPercent.toFixed(1)}% of the wallet. Verified stable reserve is ${stablecoinRatio.toFixed(1)}%. Low-liquidity exposure is ${lowLiquidityExposure.toFixed(1)}%.`,
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
        label: "Asset quality",
        severity: severityFromScore(riskSignals.assetQualityRisk),
        scoreImpact: riskSignals.assetQualityRisk,
        detail: `Unverified exposure is ${riskSignals.unverifiedExposurePercent.toFixed(1)}%; high-risk class exposure is ${riskSignals.highRiskClassExposurePercent.toFixed(1)}%; unknown price exposure is ${riskSignals.unknownPriceExposurePercent.toFixed(1)}%.`,
        raw: JSON.stringify({
          unverifiedExposurePercent: riskSignals.unverifiedExposurePercent,
          highRiskClassExposurePercent: riskSignals.highRiskClassExposurePercent,
          unknownPriceExposurePercent: riskSignals.unknownPriceExposurePercent,
        }),
        interpretation: "Unverified, meme/high-volatility and no-price holdings reduce portfolio quality.",
      },
      {
        label: "Liquidity exit risk",
        severity: severityFromScore(riskSignals.liquidityExitRisk),
        scoreImpact: riskSignals.liquidityExitRisk,
        detail: `${lowLiquidityExposure.toFixed(1)}% of holdings carry elevated liquidity risk.`,
        raw: JSON.stringify({ lowLiquidityExposurePercent: riskSignals.lowLiquidityExposurePercent }),
        interpretation: "High allocation to low-liquidity assets can make exits fragile or expensive.",
      },
      {
        label: "Volatility",
        severity: severityFromScore(riskSignals.volatilityRisk),
        scoreImpact: riskSignals.volatilityRisk,
        detail: `${volatileExposure.toFixed(1)}% of the portfolio moved 10% or more in 24h.`,
        raw: JSON.stringify({ highVolatilityExposurePercent: riskSignals.highVolatilityExposurePercent }),
        interpretation: "High-volatility exposure matters more when it is a large allocation.",
      },
      {
        label: "Correlation and chain readiness",
        severity: severityFromScore(Math.max(riskSignals.correlationRisk, riskSignals.chainExecutionRisk)),
        scoreImpact: Math.max(riskSignals.correlationRisk, riskSignals.chainExecutionRisk),
        detail: `Dominant theme exposure is ${riskSignals.dominantThemePercent.toFixed(1)}%; dominant chain exposure is ${riskSignals.dominantChainPercent.toFixed(1)}%; native gas token ${riskSignals.hasNativeGasToken ? "detected" : "not detected"}.`,
        raw: JSON.stringify({
          correlationRisk: riskSignals.correlationRisk,
          chainExecutionRisk: riskSignals.chainExecutionRisk,
          dominantThemePercent: riskSignals.dominantThemePercent,
          dominantChainPercent: riskSignals.dominantChainPercent,
          hasNativeGasToken: riskSignals.hasNativeGasToken,
        }),
        interpretation: "Theme or chain concentration and missing gas token reduce resilience and execution readiness.",
      },
      {
        label: "Top risk holdings",
        severity: topRiskHoldings.some((holding) => holding.riskScore >= 75) ? "critical" : topRiskHoldings.some((holding) => holding.riskScore >= 50) ? "high" : "medium",
        scoreImpact: topRiskHoldings[0]?.riskScore ?? portfolio.riskScore,
        detail: topRiskHoldings
          .map((holding) => `${holding.symbol} ${holding.riskScore}/100 at ${holding.allocationPercent.toFixed(1)}%`)
          .join("; "),
        raw: JSON.stringify(topRiskHoldings),
        interpretation: "These holdings contribute the most token-level risk to the portfolio.",
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
    recommendedAction,
    blockingReasons:
      riskSignals.stableReservePercent < 5 && riskSignals.highRiskExposurePercent >= 70
        ? ["Stable reserve is below 5% while high-risk exposure is at least 70%."]
        : [],
    rawSignals: {
      portfolioRisk: riskSignals,
      stablecoinRatio,
      memeExposure,
      unknownExposure,
      volatileExposure,
      lowLiquidityExposure,
      topRiskHoldings,
    },
  });
}

export async function runPortfolioAgent(walletAddress?: string): Promise<AgentResult> {
  const { portfolio, source } = await getPortfolioSnapshot(walletAddress);

  return analyzePortfolioSnapshot(portfolio, source);
}
