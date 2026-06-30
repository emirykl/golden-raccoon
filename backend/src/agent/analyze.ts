import type { AgentStep, PortfolioSnapshot } from "../types";
import { summarizePortfolioRisk } from "../portfolio/riskScoring";

export function analyzePortfolio(portfolio: PortfolioSnapshot): AgentStep {
  return {
    key: "analyze",
    label: "Analyze",
    status: "complete",
    detail: summarizePortfolioRisk(portfolio),
  };
}
