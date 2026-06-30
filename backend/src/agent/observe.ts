import type { AgentStep, PortfolioSnapshot } from "../types";

export function observePortfolio(portfolio: PortfolioSnapshot): AgentStep {
  const riskyToken = [...portfolio.holdings].sort((a, b) => b.riskScore - a.riskScore)[0];

  return {
    key: "observe",
    label: "Observe",
    status: "complete",
    detail: `Read ${portfolio.holdings.length} holdings and detected elevated ${riskyToken?.symbol ?? "token"} exposure.`,
  };
}
