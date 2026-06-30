import type { AgentDecision, AgentStep, PortfolioSnapshot, TransactionPreview } from "../types";

export function planTransaction(
  portfolio: PortfolioSnapshot,
  decision: AgentDecision,
): { step: AgentStep; preview: TransactionPreview } {
  const fromHolding = portfolio.holdings.find(
    (holding) => holding.symbol === decision.suggestedAction.fromToken,
  );
  const estimatedValueUsd = Math.round(((fromHolding?.valueUsd ?? 0) * decision.suggestedAction.percent) / 100);

  return {
    step: {
      key: "plan",
      label: "Plan",
      status: "complete",
      detail: `Prepared approval-only preview for ${decision.suggestedAction.percent}% ${decision.suggestedAction.fromToken}.`,
    },
    preview: {
      title: `Swap ${decision.suggestedAction.percent}% ${decision.suggestedAction.fromToken} to ${decision.suggestedAction.toToken}`,
      estimatedValueUsd,
      currentRiskScore: decision.riskScore,
      projectedRiskScore: 46,
      requiresApproval: true,
      network: "GOAT Network",
    },
  };
}
