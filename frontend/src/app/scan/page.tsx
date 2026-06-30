import { AppShell } from "@/components/AppShell";
import { TokenScanClient } from "@/components/TokenScanClient";

export default function ScanPage() {
  return (
    <AppShell>
      <TokenScanClient />
    </AppShell>
  );
}
