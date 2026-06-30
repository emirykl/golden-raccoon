import { Activity, ChartNoAxesCombined, RadioTower, Waves } from "lucide-react";
import type { TokenScanResult } from "@/server/types";

const signalItems = [
  {
    label: "Market",
    value: "Volatility high",
    detail: "MEME short-term moves are unstable.",
    icon: ChartNoAxesCombined,
  },
  {
    label: "X / social",
    value: "Negative",
    detail: "Scam-warning terms increased in mock scan.",
    icon: RadioTower,
  },
  {
    label: "On-chain",
    value: "Whale sells",
    detail: "Large wallets show elevated sell pressure.",
    icon: Activity,
  },
  {
    label: "Liquidity",
    value: "Falling",
    detail: "Exit depth is weaker than previous read.",
    icon: Waves,
  },
];

export function SignalSummaryCard({ scan }: { scan: TokenScanResult }) {
  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">What is happening now?</h2>
          <p className="mt-1 text-sm text-white/48">{scan.symbol} signal summary from the active agent run.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs text-white/54">2 min ago</span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {signalItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-2xl bg-white/6 p-4">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-[#d9a441]" />
                <div className="text-xs uppercase tracking-[0.16em] text-white/36">{item.label}</div>
              </div>
              <div className="mt-3 text-sm font-semibold">{item.value}</div>
              <div className="mt-1 text-xs leading-5 text-white/42">{item.detail}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
