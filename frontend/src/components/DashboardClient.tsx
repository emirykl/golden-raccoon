"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { PortfolioSnapshot } from "@/server/types";
import { AgentNetworkSummaryCard } from "@/components/AgentNetworkSummaryCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { WalletPortfolioCard } from "@/components/WalletPortfolioCard";
import { WalletConnectButton } from "@/components/WalletConnectButton";
import { shortAddress } from "@/lib/format";

export function DashboardClient() {
  const { address, isConnected } = useAccount();
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);

  useEffect(() => {
    const walletAddress = address ?? "0xDemoWallet";

    fetch(`/api/portfolio?walletAddress=${walletAddress}`)
      .then((response) => response.json())
      .then((data: PortfolioSnapshot) => setPortfolio(data));
  }, [address]);

  if (!portfolio) {
    return <div className="glass-panel rounded-[28px] p-8 text-white/56">Loading portfolio...</div>;
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-[#d9a441]">Dashboard</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Portfolio intelligence center</h1>
          <div className="mt-4 text-white/52">{isConnected ? shortAddress(address) : "Connect wallet to start"}</div>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">
              Monitoring active
            </span>
            <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-white/54">
              Strategy: Balanced
            </span>
          </div>
          {!isConnected ? <WalletConnectButton /> : null}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <WalletPortfolioCard portfolio={portfolio} walletAddress={address} />
        <RiskScoreCard score={portfolio.riskScore} />
      </div>

      <AgentNetworkSummaryCard />
    </div>
  );
}
