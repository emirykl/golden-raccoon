import type { PortfolioSnapshot } from "@/server/types";
import { formatUsd } from "@/lib/format";

export function PortfolioCard({ portfolio }: { portfolio: PortfolioSnapshot }) {
  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="text-sm text-white/54">Total portfolio value</div>
      <div className="mt-3 text-5xl font-semibold tracking-tight text-white">{formatUsd(portfolio.totalValueUsd)}</div>
      <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-white/6 p-4">
          <div className="text-white/45">Assets</div>
          <div className="mt-1 text-2xl font-semibold">{portfolio.holdings.length}</div>
        </div>
        <div className="rounded-2xl bg-white/6 p-4">
          <div className="text-white/45">Network</div>
          <div className="mt-1 text-2xl font-semibold">GOAT</div>
        </div>
      </div>
    </section>
  );
}
