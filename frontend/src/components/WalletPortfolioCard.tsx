import type { PortfolioSnapshot } from "@/server/types";
import { formatUsd, shortAddress } from "@/lib/format";

export function WalletPortfolioCard({
  portfolio,
  walletAddress,
}: {
  portfolio: PortfolioSnapshot;
  walletAddress?: string;
}) {
  const isDown = portfolio.dayChangePercent < 0;

  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-white/54">Wallet portfolio</div>
          <div className="mt-3 text-5xl font-semibold tracking-tight text-white">{formatUsd(portfolio.totalValueUsd)}</div>
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

      <div className="mt-6 space-y-3">
        {portfolio.holdings.map((holding) => (
          <div key={holding.tokenAddress} className="flex items-center justify-between gap-4 rounded-2xl bg-white/6 px-4 py-3">
            <div>
              <div className="text-sm font-semibold">{holding.symbol}</div>
              <div className="mt-1 text-xs text-white/38">{holding.allocationPercent}% allocation</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{formatUsd(holding.valueUsd)}</div>
              <div className="mt-1 text-xs text-white/38">{holding.balance.toLocaleString("en-US")}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
