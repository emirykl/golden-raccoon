import Link from "next/link";
import { ArrowRight, RadioTower, Search, WalletCards } from "lucide-react";

const actions = [
  {
    title: "Portfolio Agent",
    label: "Wallet connected",
    target: "0x5399...1B08",
    signal: "Exposure + rules",
    action: "Run portfolio agents",
    href: "/agents",
    icon: WalletCards,
    tone: "emerald",
  },
  {
    title: "Token Scan Agent",
    label: "Token / contract",
    target: "MEME or 0x...",
    signal: "Website + contract + liquidity",
    action: "Run token agents",
    href: "/scan",
    icon: Search,
    tone: "gold",
  },
  {
    title: "Social Agent",
    label: "X handle",
    target: "@project",
    signal: "Sentiment + scam warnings",
    action: "Scan X",
    href: "/scan",
    icon: RadioTower,
    tone: "blue",
  },
];

export function AgentNetworkSummaryCard() {
  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.18em] text-[#d9a441]">Agents</div>
          <h2 className="mt-3 text-2xl font-semibold">Choose what to analyze</h2>
        </div>
        <div className="hidden rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/45 sm:block">
          3 actions
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const glow =
            action.tone === "emerald"
              ? "hover:border-emerald-300/35 hover:shadow-[0_24px_80px_rgba(52,211,153,.10)]"
              : action.tone === "blue"
                ? "hover:border-sky-300/35 hover:shadow-[0_24px_80px_rgba(56,189,248,.10)]"
                : "hover:border-[#d9a441]/45 hover:shadow-[0_24px_80px_rgba(217,164,65,.12)]";

          return (
            <Link
              key={action.title}
              href={action.href}
              className={`group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[.055] p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-white/[.075] ${glow}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d9a441]/20 bg-[#d9a441]/12 text-[#d9a441]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/42">
                  Ready
                </span>
              </div>

              <div className="mt-6 text-xl font-semibold">{action.title}</div>

              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                <div className="text-xs uppercase tracking-[0.14em] text-white/30">{action.label}</div>
                <div className="mt-2 truncate text-sm font-medium text-white/72">{action.target}</div>
              </div>

              <div className="mt-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/48">{action.signal}</div>

              <div className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#d9a441] px-5 text-sm font-semibold text-black transition group-hover:bg-[#f2c86d]">
                {action.action}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
