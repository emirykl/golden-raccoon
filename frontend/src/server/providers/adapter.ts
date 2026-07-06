import type { AgentSource } from "@/server/types";

export type ProviderKind = "portfolio" | "onchain" | "news" | "social" | "decision" | "execution";

export type NormalizedProviderError = {
  code: "timeout" | "rate_limited" | "network_error" | "provider_error" | "unknown";
  message: string;
  retryable: boolean;
  rateLimited: boolean;
};

export type ProviderAdapterOptions = {
  kind: ProviderKind;
  provider: string;
  label: string;
  url?: string;
  timeoutMs?: number;
  retries?: number;
  backoffMs?: number;
  fallbackRank?: number;
  cache?: AgentSource["cache"];
};

export type ProviderAdapterResult<T> = {
  ok: boolean;
  value?: T;
  error?: NormalizedProviderError;
  elapsedMs: number;
  fallbackRank: number;
  confidenceCap: number;
  source: AgentSource;
};

export const providerTimeoutBudgets: Record<ProviderKind, number> = {
  portfolio: 8_000,
  onchain: 12_000,
  news: 8_000,
  social: 12_000,
  decision: 3_000,
  execution: 20_000,
};

export function getProviderTimeoutBudget(kind: ProviderKind) {
  return providerTimeoutBudgets[kind];
}

export function normalizeProviderError(error: unknown): NormalizedProviderError {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("timeout") || lower.includes("abort")) {
    return { code: "timeout", message, retryable: true, rateLimited: false };
  }

  if (lower.includes("429") || lower.includes("rate limit")) {
    return { code: "rate_limited", message, retryable: true, rateLimited: true };
  }

  if (lower.includes("fetch") || lower.includes("network") || lower.includes("econnreset")) {
    return { code: "network_error", message, retryable: true, rateLimited: false };
  }

  if (lower.includes("provider") || lower.includes("api")) {
    return { code: "provider_error", message, retryable: true, rateLimited: false };
  }

  return { code: "unknown", message, retryable: false, rateLimited: false };
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function withTimeout<T>(operation: () => Promise<T>, timeoutMs: number, label: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timeout after ${timeoutMs}ms`)), timeoutMs);
  });

  return Promise.race([operation(), timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export async function runProviderAdapter<T>(operation: () => Promise<T>, options: ProviderAdapterOptions): Promise<ProviderAdapterResult<T>> {
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? getProviderTimeoutBudget(options.kind);
  const retries = Math.max(0, options.retries ?? 1);
  const fallbackRank = options.fallbackRank ?? 0;
  let lastError: NormalizedProviderError | undefined;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const value = await withTimeout(operation, timeoutMs, options.label);
      const elapsedMs = Date.now() - startedAt;

      return {
        ok: true,
        value,
        elapsedMs,
        fallbackRank,
        confidenceCap: fallbackRank > 0 ? 0.68 : 0.9,
        source: {
          label: options.label,
          url: options.url,
          status: "connected",
          checkedAt: new Date().toISOString(),
          latencyMs: elapsedMs,
          provider: options.provider,
          fallbackRank,
          cache: options.cache,
          reliability: fallbackRank > 0 ? 0.62 : 0.82,
          detail: fallbackRank > 0 ? `Fallback provider ${options.provider} returned data.` : `Primary provider ${options.provider} returned data.`,
        },
      };
    } catch (error) {
      lastError = normalizeProviderError(error);

      if (!lastError.retryable || attempt === retries) {
        break;
      }

      await sleep((options.backoffMs ?? 250) * (attempt + 1));
    }
  }

  const elapsedMs = Date.now() - startedAt;

  return {
    ok: false,
    error: lastError,
    elapsedMs,
    fallbackRank,
    confidenceCap: 0.32,
    source: {
      label: options.label,
      url: options.url,
      status: "unavailable",
      checkedAt: new Date().toISOString(),
      latencyMs: elapsedMs,
      error: lastError?.message,
      errorCode: lastError?.code,
      provider: options.provider,
      fallbackRank,
      cache: options.cache,
      reliability: 0.1,
      detail: lastError ? `Provider ${options.provider} failed with ${lastError.code}.` : `Provider ${options.provider} failed.`,
    },
  };
}

export async function runProviderFallbacks<T>(
  operations: Array<ProviderAdapterOptions & { run: () => Promise<T> }>,
): Promise<ProviderAdapterResult<T>> {
  let lastResult: ProviderAdapterResult<T> | undefined;

  for (const operation of operations.sort((left, right) => (left.fallbackRank ?? 0) - (right.fallbackRank ?? 0))) {
    const result = await runProviderAdapter(operation.run, operation);

    if (result.ok) {
      return result;
    }

    lastResult = result;
  }

  if (!lastResult) {
    throw new Error("Provider fallback chain is empty.");
  }

  return lastResult;
}

export function resolveProviderConflict(input: {
  kind: "sellability" | "liquidity" | "identity";
  primaryRisk: number;
  secondaryRisk: number;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  const conservativeRisk = Math.max(input.primaryRisk, input.secondaryRisk);
  const winner =
    input.kind === "sellability" && input.secondaryLabel.toLowerCase().includes("simulation")
      ? input.secondaryLabel
      : conservativeRisk === input.primaryRisk
        ? input.primaryLabel
        : input.secondaryLabel;

  return {
    riskScore: conservativeRisk,
    winner,
    conflict: input.primaryRisk !== input.secondaryRisk,
    detail: `${winner} wins by conservative ${input.kind} conflict resolution.`,
  };
}
