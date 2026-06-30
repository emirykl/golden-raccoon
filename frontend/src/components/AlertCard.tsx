import { AlertTriangle } from "lucide-react";

export function AlertCard() {
  return (
    <section className="rounded-[28px] border border-red-400/20 bg-red-500/8 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-red-500/12 p-3 text-red-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Latest alert</h2>
          <p className="mt-2 text-sm leading-6 text-white/58">
            MEME whale sell pressure is high, liquidity is falling, and exposure exceeds your future rule target.
          </p>
        </div>
      </div>
    </section>
  );
}
