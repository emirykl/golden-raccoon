import { z } from "zod";
import type {
  AgentFinding,
  AgentResult,
  AgentScoreCard,
  AgentSource,
  RiskLevel,
  RiskReport,
  RiskReportInput,
  RiskReportVerdict,
  ScoreFactor,
  ScoreFactorCategory,
  SourceDataQuality,
} from "@/server/types";
import type { NormalizedTokenInput } from "@/server/scan/tokenInput";

const severityWeight: Record<RiskLevel, number> = {
  low: 12,
  medium: 36,
  high: 68,
  critical: 92,
};

const agentDisplayNames: Record<AgentResult["agent"], string> = {
  portfolio: "Portfolio Keeper",
  onchain: "Contract Guard",
  news: "News Oracle",
  social: "Social Scout",
  decision: "Decision Core",
  execution: "Execution Pilot",
};

export const riskReportConventions = {
  verdicts: {
    buy_small: "Buy small",
    watch: "Watch",
    avoid: "Avoid",
    hold: "Hold",
    reduce_exposure: "Reduce exposure",
    manual_review: "Manual review",
  } satisfies Record<RiskReportVerdict, string>,
  riskBands: [
    { min: 0, max: 24, label: "Low risk" },
    { min: 25, max: 49, label: "Watch risk" },
    { min: 50, max: 74, label: "High risk" },
    { min: 75, max: 100, label: "Critical risk" },
  ],
  uiTone: "Minimal, lightly game-like, and decision-first.",
};

const scoreFactorSchema = z.object({
  label: z.string(),
  category: z.string(),
  impact: z.number(),
  weight: z.number().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  detail: z.string(),
  sourceLabel: z.string().optional(),
  direction: z.enum(["risk_increase", "risk_decrease", "neutral"]),
  raw: z.unknown().optional(),
});

export const riskReportSchema = z.object({
  id: z.string(),
  chain: z.string(),
  contractAddress: z.string().optional(),
  symbol: z.string(),
  tokenName: z.string().optional(),
  buyRisk: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  verdict: z.enum(["buy_small", "watch", "avoid", "hold", "reduce_exposure", "manual_review"]),
  summary: z.string(),
  topReasons: z.array(z.string()),
  input: z.object({
    query: z.string(),
    chain: z.string(),
    contractAddress: z.string().optional(),
    pairAddress: z.string().optional(),
    pairUrl: z.string().optional(),
    symbol: z.string().optional(),
    tokenName: z.string().optional(),
    source: z.enum(["contract_address", "dexscreener_pair_url", "dexscreener_token_url", "unresolved"]),
  }),
  agentCards: z.array(
    z.object({
      agent: z.enum(["portfolio", "news", "social", "onchain", "decision", "execution"]),
      displayName: z.string(),
      score: z.number().min(0).max(100),
      scoreKind: z.enum(["risk", "trust", "signal", "exposure", "decision"]),
      confidence: z.number().min(0).max(1),
      status: z.string(),
      summary: z.string(),
      factors: z.array(scoreFactorSchema),
      sources: z.array(z.unknown()),
      missingData: z.array(z.unknown()),
    }),
  ),
  sources: z.array(z.unknown()),
  missingData: z.array(z.unknown()),
  executionPreview: z.unknown().optional(),
  createdAt: z.string(),
});

export function validateRiskReport(report: RiskReport) {
  return riskReportSchema.safeParse(report);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getReportId(input: RiskReportInput, createdAt: string) {
  const basis = `${input.chain}:${input.contractAddress ?? input.pairAddress ?? input.query}:${createdAt}`;
  let hash = 5381;

  for (let index = 0; index < basis.length; index += 1) {
    hash = (hash * 33) ^ basis.charCodeAt(index);
  }

  return `risk_${(hash >>> 0).toString(16)}`;
}

export function createRiskReportInput(query: string, chain: string | undefined, normalized: NormalizedTokenInput | null): RiskReportInput {
  if (!normalized) {
    return {
      query,
      chain: chain || "unknown",
      source: "unresolved",
    };
  }

  return {
    query,
    chain: normalized.chain,
    contractAddress: normalized.contractAddress,
    pairAddress: normalized.pairAddress,
    pairUrl: normalized.market?.pairUrl,
    symbol: normalized.symbol,
    tokenName: normalized.name,
    source: normalized.source,
  };
}

function categoryForFinding(agent: AgentResult["agent"], finding: AgentFinding): ScoreFactorCategory {
  const text = `${finding.label} ${finding.detail}`.toLowerCase();

  if (agent === "onchain") {
    if (text.includes("honeypot") || text.includes("cannot sell") || text.includes("blacklist") || text.includes("sellability")) return "sellability";
    if (text.includes("tax")) return "taxes";
    if (text.includes("liquidity") || text.includes("fdv")) return "liquidity";
    if (text.includes("holder")) return "holder_concentration";
    if (text.includes("lp") || text.includes("lock") || text.includes("burn")) return "lp_lock";
    if (text.includes("volume") || text.includes("anomaly") || text.includes("wash") || text.includes("pair age")) return "market_anomaly";
    if (text.includes("creator") || text.includes("deployer") || text.includes("owner sell")) return "creator_behavior";
    if (text.includes("owner") || text.includes("mint") || text.includes("pause") || text.includes("proxy") || text.includes("permission")) return "owner_controls";
  }

  if (agent === "social") {
    if (text.includes("phishing") || text.includes("drainer") || text.includes("claim") || text.includes("airdrop")) return "phishing";
    if (text.includes("engagement") || text.includes("bot") || text.includes("shill") || text.includes("reply")) return "social_engagement";
    return "social_identity";
  }

  if (agent === "news") {
    if (text.includes("hack") || text.includes("exploit") || text.includes("regulatory") || text.includes("scam") || text.includes("negative")) return "news_risk";
    return "news_catalyst";
  }

  if (agent === "portfolio") return "portfolio_exposure";
  if (agent === "decision") return "decision_logic";

  return "source_coverage";
}

function factorDirection(finding: AgentFinding): ScoreFactor["direction"] {
  if (finding.severity === "low" && (finding.scoreImpact ?? 0) <= 12) {
    return "risk_decrease";
  }

  if ((finding.scoreImpact ?? 0) === 0 && finding.severity === "low") {
    return "neutral";
  }

  return "risk_increase";
}

function findingToFactor(agent: AgentResult["agent"], finding: AgentFinding): ScoreFactor {
  const direction = factorDirection(finding);
  const baseImpact = finding.scoreImpact ?? severityWeight[finding.severity];

  return {
    label: finding.label,
    category: categoryForFinding(agent, finding),
    impact: direction === "risk_decrease" ? -Math.abs(baseImpact) : Math.abs(baseImpact),
    weight: finding.weight,
    severity: finding.severity,
    detail: finding.detail,
    sourceLabel: finding.sourceLabel,
    direction,
    raw: finding.raw,
  };
}

function getScoreKind(agent: AgentResult["agent"]): AgentScoreCard["scoreKind"] {
  if (agent === "portfolio") return "exposure";
  if (agent === "news") return "signal";
  if (agent === "social") return "trust";
  if (agent === "decision") return "decision";

  return "risk";
}

function resultToCard(result: AgentResult): AgentScoreCard {
  const factors = result.findings
    .map((finding) => findingToFactor(result.agent, finding))
    .sort((left, right) => {
      const severityGap = severityWeight[right.severity] - severityWeight[left.severity];

      return severityGap !== 0 ? severityGap : Math.abs(right.impact) - Math.abs(left.impact);
    });

  return {
    agent: result.agent,
    displayName: agentDisplayNames[result.agent],
    score: clampScore(result.riskScore),
    scoreKind: getScoreKind(result.agent),
    confidence: result.confidence,
    status: result.status,
    summary: result.summary,
    factors,
    sources: result.sources,
    missingData: result.missingData,
  };
}

function verdictFromDecision(decision: AgentResult): RiskReportVerdict {
  if (decision.confidence < 0.42) return "manual_review";
  if (decision.recommendedAction === "avoid") return "avoid";
  if (decision.recommendedAction === "reduce_exposure") return "reduce_exposure";
  if (decision.recommendedAction === "swap_to_stable") return "reduce_exposure";
  if (decision.recommendedAction === "hold") return "hold";
  if (decision.recommendedAction === "manual_review") return "manual_review";

  if (decision.riskScore <= 24 && decision.confidence >= 0.62) {
    return "buy_small";
  }

  return "watch";
}

function getTopReasons(results: AgentResult[], decision: AgentResult) {
  const critical = results
    .flatMap((result) => result.findings.map((finding) => ({ result, finding })))
    .filter(({ finding }) => finding.severity === "critical" || finding.severity === "high")
    .sort((left, right) => severityWeight[right.finding.severity] - severityWeight[left.finding.severity])
    .map(({ result, finding }) => `${agentDisplayNames[result.agent]}: ${finding.detail}`);
  const decisionReasons = decision.findings.map((finding) => `${agentDisplayNames.decision}: ${finding.detail}`);

  return [...critical, ...decisionReasons].slice(0, 5);
}

function getMissingData(results: AgentResult[]) {
  return results.flatMap((result) =>
    result.missingData.map((item) => ({
      ...item,
      field: `${agentDisplayNames[result.agent]}: ${item.field}`,
    })),
  );
}

function getSources(results: AgentResult[]): AgentSource[] {
  return results.flatMap((result) =>
    result.sources.map((source) => ({
      ...source,
      label: `${agentDisplayNames[result.agent]} - ${source.label}`,
    })),
  );
}

function conservativeSummary(report: {
  symbol: string;
  buyRisk: number;
  confidence: number;
  decisionSummary: string;
  topReasons: string[];
}) {
  const riskText = report.buyRisk >= 75 ? "kritik" : report.buyRisk >= 50 ? "yuksek" : report.buyRisk >= 25 ? "izlenebilir" : "dusuk";
  const confidenceText = Math.round(report.confidence * 100);
  const mainReason = report.topReasons[0] ? ` Ana sebep: ${report.topReasons[0]}` : "";

  return `${report.symbol} icin alim riski ${riskText} (%${report.buyRisk}). Confidence %${confidenceText}. ${report.decisionSummary}${mainReason}`;
}

export function buildRiskReport(input: {
  query: string;
  requestedChain?: string;
  normalized: NormalizedTokenInput | null;
  results: AgentResult[];
  decision: AgentResult;
  dataQuality?: SourceDataQuality;
  createdAt?: string;
}): RiskReport {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const reportInput = createRiskReportInput(input.query, input.requestedChain, input.normalized);
  const symbol = input.normalized?.symbol ?? (input.query.trim().slice(0, 16).toUpperCase() || "UNKNOWN");
  const buyRisk = clampScore(input.decision.riskScore);
  const confidence = input.dataQuality?.connectedSources === 0 ? Math.min(input.decision.confidence, 0.32) : input.decision.confidence;
  const topReasons = getTopReasons(input.results, input.decision);
  const report: RiskReport = {
    id: getReportId(reportInput, createdAt),
    chain: reportInput.chain,
    contractAddress: reportInput.contractAddress,
    symbol,
    tokenName: input.normalized?.name,
    buyRisk,
    confidence,
    verdict: confidence < 0.42 ? "manual_review" : verdictFromDecision(input.decision),
    summary: conservativeSummary({
      symbol,
      buyRisk,
      confidence,
      decisionSummary: input.decision.summary,
      topReasons,
    }),
    topReasons,
    input: reportInput,
    agentCards: input.results.map(resultToCard),
    sources: getSources(input.results),
    missingData: getMissingData(input.results),
    createdAt,
  };
  const parsed = validateRiskReport(report);

  if (!parsed.success) {
    throw new Error(`Invalid RiskReport generated: ${parsed.error.message}`);
  }

  return report;
}
