type EnvCheck = {
  key: string;
  configured: boolean;
  visibility: "server" | "public";
  detail: string;
};

const serverEnvKeys = [
  "GOLDRUSH_API_KEY",
  "COVALENT_API_KEY",
  "GOPLUS_API_KEY",
  "ALCHEMY_API_KEY",
  "GOAT_RPC_URL",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

const publicEnvKeys = ["NEXT_PUBLIC_GOAT_RPC_URL"] as const;

export function getEnvHealth() {
  const checks: EnvCheck[] = [
    ...serverEnvKeys.map((key) => ({
      key,
      configured: Boolean(process.env[key]),
      visibility: "server" as const,
      detail: process.env[key] ? "Configured server-side." : "Missing; dependent source should report unavailable.",
    })),
    ...publicEnvKeys.map((key) => ({
      key,
      configured: Boolean(process.env[key]),
      visibility: "public" as const,
      detail: process.env[key] ? "Configured as public client config." : "Missing public fallback config.",
    })),
  ];

  const requiredForLiveMvp = ["GOLDRUSH_API_KEY", "COVALENT_API_KEY", "GOPLUS_API_KEY"];
  const configuredLiveSources = requiredForLiveMvp.filter((key) => Boolean(process.env[key]));

  return {
    checks,
    liveSourceCount: configuredLiveSources.length,
    status: configuredLiveSources.length > 0 ? "partial" : "unavailable",
    mockFallbacksEnabled: false,
    realDataReadiness: {
      portfolio: Boolean(process.env.GOLDRUSH_API_KEY ?? process.env.COVALENT_API_KEY ?? process.env.ALCHEMY_API_KEY),
      onchain: Boolean(process.env.GOPLUS_API_KEY) || true,
      news: true,
      social: false,
      execution: true,
    },
    detail:
      configuredLiveSources.length > 0
        ? "At least one live data source is configured. Missing sources must stay transparent in UI."
        : "No live API source is configured. App returns unavailable states instead of mock confidence.",
  };
}
