import { isAddress } from "viem";
import { normalizeScanNetworkId } from "@/lib/scanNetworks";

export type NormalizedTokenInput = {
  chain: string;
  contractAddress: string;
  pairAddress?: string;
  symbol?: string;
  name?: string;
  links?: {
    websiteUrl?: string;
    twitterUrl?: string;
    telegramUrl?: string;
  };
  market?: {
    pairAddress?: string;
    dexId?: string;
    pairUrl?: string;
    priceUsd?: number;
    liquidityUsd?: number;
    volume24hUsd?: number;
    fdvUsd?: number;
    marketCapUsd?: number;
    priceChange24hPercent?: number;
    pairAgeDays?: number;
  };
  source: "dexscreener_pair_url" | "dexscreener_token_url" | "contract_address";
};

type DexScreenerPairResponse = {
  pairs?: Array<{
    chainId?: string;
    dexId?: string;
    url?: string;
    pairAddress?: string;
    priceUsd?: string;
    liquidity?: {
      usd?: number;
    };
    volume?: {
      h24?: number;
    };
    priceChange?: {
      h24?: number;
    };
    fdv?: number;
    marketCap?: number;
    pairCreatedAt?: number;
    baseToken?: {
      address?: string;
      name?: string;
      symbol?: string;
    };
    quoteToken?: {
      address?: string;
      name?: string;
      symbol?: string;
    };
    info?: {
      websites?: Array<{
        label?: string;
        url?: string;
      }>;
      socials?: Array<{
        type?: string;
        url?: string;
      }>;
    };
  }> | null;
};

type DexScreenerPair = NonNullable<DexScreenerPairResponse["pairs"]>[number];

function getPairAgeDays(pairCreatedAt?: number) {
  if (!pairCreatedAt) {
    return undefined;
  }

  return Math.max(0, Math.floor((Date.now() - pairCreatedAt) / 86_400_000));
}

function parseDexScreenerUrl(query: string) {
  try {
    const url = new URL(query);

    if (!url.hostname.includes("dexscreener.com")) {
      return null;
    }

    const [, chain, address] = url.pathname.split("/");

    if (!chain || !address) {
      return null;
    }

    return {
      chain: chain.toLowerCase(),
      address,
    };
  } catch {
    return null;
  }
}

async function resolveDexScreenerPair(chain: string, pairAddress: string): Promise<NormalizedTokenInput | null> {
  const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`, {
    next: { revalidate: 60 * 5 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as DexScreenerPairResponse;
  const pair = payload.pairs?.[0];
  const tokenAddress = pair?.baseToken?.address;
  const twitterUrl = pair?.info?.socials?.find((social) => social.type?.toLowerCase() === "twitter" || social.type?.toLowerCase() === "x")?.url;
  const telegramUrl = pair?.info?.socials?.find((social) => social.type?.toLowerCase() === "telegram")?.url;
  const websiteUrl = pair?.info?.websites?.[0]?.url;

  if (!tokenAddress) {
    return null;
  }

  return {
    chain: pair.chainId ?? chain,
    contractAddress: tokenAddress,
    pairAddress: pair.pairAddress ?? pairAddress,
    symbol: pair.baseToken?.symbol,
    name: pair.baseToken?.name,
    links: {
      websiteUrl,
      twitterUrl,
      telegramUrl,
    },
    market: {
      pairAddress: pair.pairAddress ?? pairAddress,
      dexId: pair.dexId,
      pairUrl: pair.url,
      priceUsd: pair.priceUsd ? Number(pair.priceUsd) : undefined,
      liquidityUsd: pair.liquidity?.usd,
      volume24hUsd: pair.volume?.h24,
      fdvUsd: pair.fdv,
      marketCapUsd: pair.marketCap,
      priceChange24hPercent: pair.priceChange?.h24,
      pairAgeDays: getPairAgeDays(pair.pairCreatedAt),
    },
    source: "dexscreener_pair_url",
  };
}

function getMatchingToken(pair: DexScreenerPair, contractAddress: string) {
  const normalizedAddress = contractAddress.toLowerCase();

  if (pair.baseToken?.address?.toLowerCase() === normalizedAddress) return pair.baseToken;
  if (pair.quoteToken?.address?.toLowerCase() === normalizedAddress) return pair.quoteToken;

  return null;
}

function pairLiquidity(pair: DexScreenerPair) {
  return pair.liquidity?.usd ?? 0;
}

async function resolveContractAddress(contractAddress: string, requestedChain?: string): Promise<NormalizedTokenInput | null> {
  const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(contractAddress)}`, {
    next: { revalidate: 60 * 5 },
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as DexScreenerPairResponse;
  const exactMatches = (payload.pairs ?? []).filter((pair) => Boolean(getMatchingToken(pair, contractAddress)));

  if (exactMatches.length === 0) return null;

  const normalizedRequestedChain = normalizeScanNetworkId(requestedChain);
  const requestedChainMatches = exactMatches.filter((pair) => normalizeScanNetworkId(pair.chainId) === normalizedRequestedChain);
  const candidates = requestedChainMatches.length > 0 ? requestedChainMatches : exactMatches;
  const pair = [...candidates].sort((left, right) => pairLiquidity(right) - pairLiquidity(left))[0];
  const token = getMatchingToken(pair, contractAddress);

  if (!pair || !token) return null;

  const twitterUrl = pair.info?.socials?.find((social) => social.type?.toLowerCase() === "twitter" || social.type?.toLowerCase() === "x")?.url;
  const telegramUrl = pair.info?.socials?.find((social) => social.type?.toLowerCase() === "telegram")?.url;

  return {
    chain: normalizeScanNetworkId(pair.chainId) || normalizeScanNetworkId(requestedChain) || "base",
    contractAddress,
    pairAddress: pair.pairAddress,
    symbol: token.symbol,
    name: token.name,
    links: {
      websiteUrl: pair.info?.websites?.[0]?.url,
      twitterUrl,
      telegramUrl,
    },
    market: {
      pairAddress: pair.pairAddress,
      dexId: pair.dexId,
      pairUrl: pair.url,
      priceUsd: pair.priceUsd ? Number(pair.priceUsd) : undefined,
      liquidityUsd: pair.liquidity?.usd,
      volume24hUsd: pair.volume?.h24,
      fdvUsd: pair.fdv,
      marketCapUsd: pair.marketCap,
      priceChange24hPercent: pair.priceChange?.h24,
      pairAgeDays: getPairAgeDays(pair.pairCreatedAt),
    },
    source: "contract_address",
  };
}

export async function normalizeTokenInput(query: string, chain?: string): Promise<NormalizedTokenInput | null> {
  const trimmed = query.trim();
  const dexScreenerUrl = parseDexScreenerUrl(trimmed);

  if (dexScreenerUrl) {
    if (isAddress(dexScreenerUrl.address)) {
      const pairResolved = await resolveDexScreenerPair(dexScreenerUrl.chain, dexScreenerUrl.address).catch(() => null);

      return (
        pairResolved ?? {
          chain: dexScreenerUrl.chain,
          contractAddress: dexScreenerUrl.address,
          source: "dexscreener_token_url",
        }
      );
    }

    return await resolveDexScreenerPair(dexScreenerUrl.chain, dexScreenerUrl.address).catch(() => null);
  }

  if (isAddress(trimmed)) {
    const resolved = await resolveContractAddress(trimmed, chain).catch(() => null);

    return resolved ?? { chain: normalizeScanNetworkId(chain) || "base", contractAddress: trimmed, source: "contract_address" };
  }

  return null;
}
