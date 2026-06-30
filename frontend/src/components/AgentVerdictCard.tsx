import Link from "next/link";
import type { TokenScanResult } from "@/server/types";
import { ArrowRight, ShieldAlert } from "lucide-react";

export function AgentVerdictCard({ scan }: { scan: TokenScanResult }) {
  return (
    <section className="rounded-[28px] border border-[#d9a441]/25 bg-[#d9a441]/8 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-[#d9a441]/14 p-3 text-[#d9a441]">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm uppercase tracking-[0.18em] text-[#d9a441]">Latest agent verdict</div>
          <h2 className="mt-3 text-2xl font-semibold">{scan.symbol} needs protection review</h2>
          <p className="mt-3 text-sm leading-6 text-white/58">{scan.summary}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/agents"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#d9a441] px-5 text-sm font-semibold text-black transition hover:bg-[#f2c86d]"
            >
              Review Action
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/scan"
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Run Token Scan
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
