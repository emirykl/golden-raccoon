import type { TokenHolding } from "@/server/types";
import { formatPercent, formatUsd } from "@/lib/format";

export function TokenTable({ holdings }: { holdings: TokenHolding[] }) {
  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Token exposure</h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.16em] text-white/36">
            <tr>
              <th className="pb-3 font-medium">Token</th>
              <th className="pb-3 font-medium">Balance</th>
              <th className="pb-3 font-medium">Value</th>
              <th className="pb-3 font-medium">Exposure</th>
              <th className="pb-3 font-medium">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {holdings.map((holding) => (
              <tr key={holding.tokenAddress}>
                <td className="py-4">
                  <div className="font-semibold">{holding.symbol}</div>
                  <div className="text-xs text-white/42">{holding.name}</div>
                </td>
                <td className="py-4 text-white/72">{holding.balance.toLocaleString("en-US")}</td>
                <td className="py-4 text-white/72">{formatUsd(holding.valueUsd)}</td>
                <td className="py-4 text-white/72">{formatPercent(holding.allocationPercent)}</td>
                <td className="py-4">
                  <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs">
                    {holding.riskScore}/100
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
