import type { TransactionRecord } from "@/server/types";
import { formatUsd } from "@/lib/format";

function shortHash(hash: string) {
  return `${hash.slice(0, 7)}...${hash.slice(-5)}`;
}

export function RecentTransactions({ transactions }: { transactions: TransactionRecord[] }) {
  return (
    <section className="glass-panel rounded-[28px] p-6">
      <h2 className="text-xl font-semibold">Recent transactions</h2>
      <div className="mt-5 space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.hash} className="flex items-center justify-between gap-4 rounded-2xl bg-white/6 p-4">
            <div>
              <div className="text-sm font-medium capitalize">{transaction.type.replace("_", " ")}</div>
              <div className="mt-1 text-xs text-white/42">
                {shortHash(transaction.hash)} · {transaction.asset}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{transaction.valueUsd ? formatUsd(transaction.valueUsd) : "No value"}</div>
              <div className="mt-1 text-xs capitalize text-emerald-300">{transaction.status}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
