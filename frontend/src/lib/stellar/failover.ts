export type ProviderAttempt = {
  url: string;
  ok: boolean;
  error?: string;
};

export async function executeWithFallback<T>(urls: readonly string[], operation: (url: string, index: number) => Promise<T>) {
  if (urls.length === 0) throw new Error("At least one provider URL is required.");
  const attempts: ProviderAttempt[] = [];

  for (const [index, url] of urls.entries()) {
    try {
      const value = await operation(url, index);
      attempts.push({ url, ok: true });
      return { value, providerUrl: url, providerIndex: index, fallbackUsed: index > 0, attempts };
    } catch (cause) {
      attempts.push({ url, ok: false, error: cause instanceof Error ? cause.message : "Unknown provider error" });
    }
  }

  throw new AggregateError(attempts.map((attempt) => new Error(`${attempt.url}: ${attempt.error}`)), "All Stellar providers failed.");
}
