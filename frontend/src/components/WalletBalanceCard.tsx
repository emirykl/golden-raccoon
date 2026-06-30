import type { PortfolioSnapshot } from "@/server/types";
import { formatUsd } from "@/lib/format";

export function WalletBalanceCard({ portfolio }: { portfolio: PortfolioSnapshot }) {
  const isDown = portfolio.dayChangePercent < 0;

  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="text-sm text-white/54">Wallet balance</div>
      <div className="mt-3 flex items-end gap-3">
        <div className="text-4xl font-semibold tracking-tight">{portfolio.nativeBalance.toLocaleString("en-US")}</div>
        <div className="pb-1 text-lg font-medium text-[#d9a441]">{portfolio.nativeSymbol}</div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/6 p-4">
          <div className="text-white/45">Portfolio</div>
          <div className="mt-1 text-2xl font-semibold">{formatUsd(portfolio.totalValueUsd)}</div>
        </div>
        <div className="rounded-2xl bg-white/6 p-4">
          <div className="text-white/45">24h</div>
          <div className={isDown ? "mt-1 text-2xl font-semibold text-red-300" : "mt-1 text-2xl font-semibold text-emerald-300"}>
            {portfolio.dayChangePercent}%
          </div>
        </div>
      </div>
    </section>
  );
}
