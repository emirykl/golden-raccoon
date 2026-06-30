import type { RiskBreakdownItem, RiskLevel, TokenScanResult } from "../types";

function severity(score: number): RiskLevel {
  if (score >= 85) return "critical";
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function item(
  key: RiskBreakdownItem["key"],
  label: string,
  score: number,
  finding: string,
): RiskBreakdownItem {
  return {
    key,
    label,
    score,
    severity: severity(score),
    finding,
  };
}

const scanBySymbol: Record<string, Omit<TokenScanResult, "scannedAt">> = {
  MEME: {
    symbol: "MEME",
    tokenAddress: "0x0000000000000000000000000000000000000c33",
    chain: "GOAT Network",
    overallRiskScore: 88,
    opportunityScore: 18,
    verdict: "critical",
    summary:
      "MEME is high risk because project trust signals are weak, X sentiment is negative, liquidity is falling, and the wallet exposure is too large.",
    reasons: [
      "Project website has no visible team, audit, or detailed docs in the mock scan.",
      "X/social scan found negative sentiment and scam warnings around recent posts.",
      "Liquidity dropped while whale wallets increased sell pressure.",
      "Top holder concentration is high and this wallet holds 42% exposure.",
    ],
    suggestedAction: {
      type: "swap_to_stablecoin",
      fromToken: "MEME",
      toToken: "USDC",
      percent: 30,
    },
    riskBreakdown: [
      item("scam", "Scam / rug signals", 86, "Weak project legitimacy signals and multiple warning patterns."),
      item("website", "Website trust", 78, "No visible team, audit page, or deep documentation in the scan."),
      item("contract", "Contract security", 72, "Mock contract scan flags admin-controlled risk surfaces."),
      item("liquidity", "Liquidity", 84, "Liquidity trend is falling, making exits more fragile."),
      item("whales", "Whale selling", 93, "Large wallets show elevated sell pressure."),
      item("xSentiment", "X sentiment", 79, "Recent social signal is negative with scam-related mentions."),
      item("holders", "Holder concentration", 88, "Top holders control a high share of supply."),
      item("volatility", "Price volatility", 81, "Short-term volatility is elevated."),
      item("portfolioExposure", "Portfolio exposure", 91, "Token is 42% of the demo wallet portfolio."),
    ],
    sources: [
      { label: "Project website", status: "mock", detail: "Team, docs, audit and social links checked." },
      { label: "X/social", status: "mock", detail: "Recent posts, warning keywords and sentiment checked." },
      { label: "On-chain", status: "mock", detail: "Holder concentration, whale flows and liquidity checked." },
      { label: "Contract", status: "mock", detail: "Owner/admin flags and suspicious controls checked." },
    ],
  },
  GOAT: {
    symbol: "GOAT",
    tokenAddress: "0x0000000000000000000000000000000000000a11",
    chain: "GOAT Network",
    overallRiskScore: 28,
    opportunityScore: 72,
    verdict: "safe",
    summary: "GOAT shows low demo risk with healthier liquidity, lower holder concentration, and stable social signals.",
    reasons: [
      "Website and docs are present in the mock scan.",
      "No elevated whale sell pressure detected.",
      "Liquidity trend is stable.",
    ],
    suggestedAction: {
      type: "hold",
      fromToken: "GOAT",
      toToken: "USDC",
      percent: 0,
    },
    riskBreakdown: [
      item("scam", "Scam / rug signals", 14, "No major scam pattern found in mock scan."),
      item("website", "Website trust", 18, "Project surface appears consistent."),
      item("contract", "Contract security", 22, "No critical contract warning in mock scan."),
      item("liquidity", "Liquidity", 24, "Liquidity appears stable."),
      item("whales", "Whale selling", 18, "No major whale exits detected."),
      item("xSentiment", "X sentiment", 22, "Social signal is neutral to positive."),
      item("holders", "Holder concentration", 28, "Holder distribution is acceptable."),
      item("volatility", "Price volatility", 31, "Normal volatility for the demo market."),
      item("portfolioExposure", "Portfolio exposure", 36, "Wallet exposure is meaningful but not dominant."),
    ],
    sources: [
      { label: "Project website", status: "mock", detail: "Docs and social consistency checked." },
      { label: "X/social", status: "mock", detail: "Sentiment and warning terms checked." },
      { label: "On-chain", status: "mock", detail: "Liquidity and whale flows checked." },
      { label: "Contract", status: "mock", detail: "Basic contract flags checked." },
    ],
  },
};

export function getMockTokenScan(query = "MEME"): TokenScanResult {
  const normalized = query.trim().toUpperCase();
  const scan = scanBySymbol[normalized] ?? scanBySymbol.MEME;

  return {
    ...scan,
    scannedAt: new Date().toISOString(),
  };
}
