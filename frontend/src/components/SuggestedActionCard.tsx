import type { AgentDecision } from "@/server/types";
import { ArrowRightLeft } from "lucide-react";

export function SuggestedActionCard({ decision }: { decision: AgentDecision }) {
  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-[#d9a441]/12 p-3 text-[#d9a441]">
          <ArrowRightLeft className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm uppercase tracking-[0.18em] text-[#d9a441]">Suggested action</div>
          <h2 className="mt-2 text-2xl font-semibold">{decision.decision}</h2>
          <ul className="mt-5 space-y-2 text-sm text-white/62">
            {decision.reasoning.map((reason) => (
              <li key={reason} className="rounded-2xl bg-white/6 px-4 py-3">
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
