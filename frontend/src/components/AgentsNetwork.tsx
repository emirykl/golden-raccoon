import { Activity, BadgeCheck, Bot, Brain, ChartCandlestick, Fingerprint, Radar, ShieldCheck } from "lucide-react";
import { AgentAnalysisClient } from "@/components/AgentAnalysisClient";

const agents = [
  {
    name: "Portfolio Agent",
    status: "complete",
    confidence: "94%",
    finding: "MEME is 42% of the wallet and exceeds the balanced strategy limit.",
    output: "Exposure risk detected",
    icon: Radar,
  },
  {
    name: "Market Intelligence Agent",
    status: "monitoring",
    confidence: "81%",
    finding: "Liquidity is weakening while volatility remains elevated.",
    output: "Market caution",
    icon: ChartCandlestick,
  },
  {
    name: "Social Sentiment Agent",
    status: "warning",
    confidence: "78%",
    finding: "X/social scan shows negative sentiment and scam-warning keywords.",
    output: "Negative social signal",
    icon: Activity,
  },
  {
    name: "On-chain Risk Agent",
    status: "warning",
    confidence: "88%",
    finding: "Whale wallets show increased sell pressure and holder concentration is high.",
    output: "On-chain risk high",
    icon: ShieldCheck,
  },
  {
    name: "Project Legitimacy Agent",
    status: "analyzing",
    confidence: "73%",
    finding: "Website trust is weak: no visible audit, team page, or detailed docs in mock scan.",
    output: "Trust gap found",
    icon: Fingerprint,
  },
  {
    name: "Rules Agent",
    status: "complete",
    confidence: "96%",
    finding: "User rule triggered: meme exposure and token risk are above configured limits.",
    output: "Rule triggered",
    icon: BadgeCheck,
  },
  {
    name: "Decision Agent",
    status: "complete",
    confidence: "78%",
    finding: "Reduce MEME exposure by 30% and move value to USDC.",
    output: "Recommendation ready",
    icon: Brain,
  },
  {
    name: "Execution Agent",
    status: "idle",
    confidence: "Manual",
    finding: "Waiting for explicit wallet approval before preparing execution.",
    output: "Approval required",
    icon: Bot,
  },
];

const timeline = [
  "Wallet holdings read",
  "Market and liquidity scan complete",
  "X/social sentiment flagged warnings",
  "On-chain whale activity checked",
  "User rules evaluated",
  "Decision generated",
  "Execution waiting for approval",
];

export function AgentsNetwork() {
  return (
    <div className="space-y-8">
      <section>
        <div className="text-sm uppercase tracking-[0.2em] text-[#d9a441]">Agents</div>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Agent network
        </h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {agents.map((agent) => {
          const Icon = agent.icon;

          return (
            <div key={agent.name} className="glass-panel rounded-[28px] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl bg-[#d9a441]/12 p-3 text-[#d9a441]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs capitalize text-white/58">
                  {agent.status}
                </span>
              </div>
              <h2 className="mt-5 text-lg font-semibold">{agent.name}</h2>
              <p className="mt-3 min-h-16 text-sm leading-6 text-white/50">{agent.output}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/6 p-3">
                  <div className="text-white/36">Confidence</div>
                  <div className="mt-1 font-semibold">{agent.confidence}</div>
                </div>
                <div className="rounded-2xl bg-white/6 p-3">
                  <div className="text-white/36">Signal</div>
                  <div className="mt-1 font-semibold capitalize">{agent.status}</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
        <div className="glass-panel rounded-[28px] p-6">
          <h2 className="text-xl font-semibold">Current run</h2>
          <div className="mt-6 space-y-4">
            {timeline.map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d9a441]/30 bg-[#d9a441]/10 text-sm font-semibold text-[#d9a441]">
                  {index + 1}
                </div>
                <div className="text-sm text-white/60">{item}</div>
              </div>
            ))}
          </div>
        </div>
        <AgentAnalysisClient />
      </section>
    </div>
  );
}
