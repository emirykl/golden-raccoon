import { AppShell } from "@/components/AppShell";
import { getMockDecisionHistory } from "@/server/agent";

export default function HistoryPage() {
  const decisions = getMockDecisionHistory();

  return (
    <AppShell>
      <div className="space-y-8">
        <section>
          <div className="text-sm uppercase tracking-[0.2em] text-[#d9a441]">History</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Agent decisions</h1>
        </section>
        <section className="glass-panel rounded-[28px] p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/36">
                <tr>
                  <th className="pb-3 font-medium">Decision</th>
                  <th className="pb-3 font-medium">Risk</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tx hash</th>
                  <th className="pb-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {decisions.map((decision) => (
                  <tr key={`${decision.createdAt}-${decision.decision}`}>
                    <td className="py-4">
                      <div className="font-semibold">{decision.decision}</div>
                      <div className="mt-1 max-w-xl text-xs text-white/42">{decision.summary}</div>
                    </td>
                    <td className="py-4 text-white/70">{decision.riskScore}/100</td>
                    <td className="py-4">
                      <span className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs capitalize">
                        {decision.status}
                      </span>
                    </td>
                    <td className="py-4 text-white/58">{decision.txHash ?? "No transaction"}</td>
                    <td className="py-4 text-white/58">{new Date(decision.createdAt).toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
