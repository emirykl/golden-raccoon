import type { PortfolioSnapshot } from "@/server/types";
import { formatUsd, shortAddress } from "@/lib/format";
import { BadgeCheck } from "lucide-react";

const tokenLogos: Record<string, { label: string; className: string }> = {
  GOAT: {
    label: "G",
    className: "bg-[#d9a441] text-black",
  },
  USDC: {
    label: "$",
    className: "bg-[#2775ca] text-white",
  },
  MEME: {
    label: "M",
    className: "bg-[#ff5f57] text-white",
  },
  SOL: {
    label: "S",
    className: "bg-[#14f195] text-black",
  },
  ETH: {
    label: "E",
    className: "bg-white text-[#111]",
  },
  BTC: {
    label: "B",
    className: "bg-[#f7931a] text-white",
  },
};

export function WalletPortfolioCard({
  portfolio,
  walletAddress,
}: {
  portfolio: PortfolioSnapshot;
  walletAddress?: string;
}) {
  const isDown = portfolio.dayChangePercent < 0;

  return (
    <section className="glass-panel rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/54">Wallet assets</div>
          <div className="mt-2 text-5xl font-semibold tracking-tight text-white">{formatUsd(portfolio.totalValueUsd)}</div>
        </div>
        <div className="text-right text-sm">
          <div className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-white/56">
            {shortAddress(walletAddress ?? portfolio.walletAddress)}
          </div>
          <div className={isDown ? "mt-3 text-red-300" : "mt-3 text-emerald-300"}>
            {portfolio.dayChangePercent}% 24h
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {portfolio.holdings.map((holding) => {
          const logo = tokenLogos[holding.symbol] ?? {
            label: holding.symbol.slice(0, 1),
            className: "bg-white/12 text-white",
          };

          return (
            <div
              key={holding.tokenAddress}
              className="flex min-h-20 items-center justify-between gap-4 rounded-[24px] bg-white/[.065] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold ${logo.className}`}>
                  {logo.label}
                </div>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="truncate text-lg font-semibold">{holding.symbol}</div>
                    <BadgeCheck className="h-5 w-5 shrink-0 fill-[#a996ff] text-[#a996ff]" />
                  </div>
                  <div className="mt-1 truncate text-sm text-white/48">
                    {holding.balance.toLocaleString("en-US", { maximumFractionDigits: 4 })} {holding.symbol}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-lg font-semibold">{formatUsd(holding.valueUsd)}</div>
                <div className={holding.riskLevel === "high" || holding.riskLevel === "critical" ? "mt-1 text-sm text-red-300" : "mt-1 text-sm text-white/42"}>
                  {holding.allocationPercent}% allocation
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
