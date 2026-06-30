import Link from "next/link";
import type { TokenScanResult } from "@/server/types";
import { ArrowRight, Check, X } from "lucide-react";
import { formatUsd } from "@/lib/format";

const topReasons = ["MEME is 42% of wallet", "Whale selling is high", "Liquidity is falling"];

export function CurrentRecommendationCard({ scan }: { scan: TokenScanResult }) {
  return (
    <section className="rounded-[28px] border border-[#d9a441]/25 bg-[#d9a441]/8 p-6">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="max-w-3xl">
          <div className="text-sm uppercase tracking-[0.18em] text-[#d9a441]">Recommendation ready</div>
          <h2 className="mt-3 text-3xl font-semibold">Reduce {scan.symbol} exposure by 30%</h2>
          <div className="mt-3 text-sm font-medium text-white/58">{formatUsd(183)} MEME to USDC</div>
          <div className="mt-5 grid gap-2 text-sm text-white/60 sm:grid-cols-3">
            {topReasons.map((reason) => (
              <div key={reason} className="rounded-2xl bg-black/20 px-4 py-3">
                {reason}
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-w-56 flex-col gap-3">
          <Link
            href="/agents"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#d9a441] px-5 text-sm font-semibold text-black transition hover:bg-[#f2c86d]"
          >
            Review Details
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-5 text-sm font-semibold text-emerald-100"
          >
            <Check className="h-4 w-4" />
            Approve
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-sm font-medium text-white/70"
          >
            <X className="h-4 w-4" />
            Reject
          </button>
        </div>
      </div>
    </section>
  );
}
