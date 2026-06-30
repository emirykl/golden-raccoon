"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import type { AgentAnalysisResult } from "@/server/agent";
import { AgentTimeline } from "@/components/AgentTimeline";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { SuggestedActionCard } from "@/components/SuggestedActionCard";
import { TransactionPreview } from "@/components/TransactionPreview";

export function AgentAnalysisClient() {
  const { address } = useAccount();
  const [analysis, setAnalysis] = useState<AgentAnalysisResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  async function runAgent() {
    setIsRunning(true);
    setTxHash(null);

    const response = await fetch("/api/agent/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address ?? "0xDemoWallet" }),
    });
    const data = (await response.json()) as AgentAnalysisResult;

    setAnalysis(data);
    setIsRunning(false);
  }

  function approveAction() {
    setTxHash(`0x${crypto.randomUUID().replaceAll("-", "").slice(0, 32)}`);
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-[#d9a441]">Recommendation review</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Run decision analysis</h1>
        </div>
        <button
          type="button"
          onClick={runAgent}
          disabled={isRunning}
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#d9a441] px-6 text-sm font-semibold text-black transition hover:bg-[#f2c86d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning ? "Running..." : "Run Decision Analysis"}
        </button>
      </section>

      {!analysis ? (
        <section className="glass-panel rounded-[28px] p-8">
          <div className="text-2xl font-semibold">Ready for demo analysis</div>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
          <div className="space-y-5">
            <RiskScoreCard score={analysis.decision.riskScore} />
            <AgentTimeline steps={analysis.steps} />
          </div>
          <div className="space-y-5">
            <SuggestedActionCard decision={analysis.decision} />
            <TransactionPreview preview={analysis.preview} />
            <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-white/6 p-5 sm:flex-row">
              <button
                type="button"
                onClick={approveAction}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#d9a441] px-6 text-sm font-semibold text-black transition hover:bg-[#f2c86d]"
              >
                Approve Action
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-6 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Reject
              </button>
            </div>
            {txHash ? (
              <div className="rounded-[24px] border border-emerald-400/25 bg-emerald-400/10 p-5 text-sm text-emerald-100">
                Demo tx hash recorded: {txHash}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
