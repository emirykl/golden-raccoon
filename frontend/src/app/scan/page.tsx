import { AppShell } from "@/components/AppShell";
import { TokenScanClient } from "@/components/TokenScanClient";

export default async function ScanPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const query = (await searchParams)?.query;

  return (
    <AppShell>
      <TokenScanClient initialQuery={query} />
    </AppShell>
  );
}
