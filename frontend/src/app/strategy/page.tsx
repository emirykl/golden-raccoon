import { AppShell } from "@/components/AppShell";
import { StrategyClient } from "@/components/StrategyClient";
import { getDefaultRules } from "@/server/rules/defaultRules";

export default function StrategyPage() {
  return (
    <AppShell>
      <StrategyClient initialRules={getDefaultRules()} />
    </AppShell>
  );
}
