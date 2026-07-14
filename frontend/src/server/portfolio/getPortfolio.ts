import type { PortfolioSnapshot } from "@/server/types";
import { getChainFamily, isStellarAccountAddress } from "@/lib/chainIdentity";
import { getDefaultStellarNetwork, normalizeStellarNetworkId } from "@/lib/stellar/config";
import { getRealPortfolio } from "@/server/portfolio/realPortfolio";

export type PortfolioSnapshotSource = {
  status: "connected" | "unavailable";
  provider: "real_portfolio" | "no_live_portfolio";
  detail: string;
};

export type PortfolioSnapshotResult = {
  portfolio: PortfolioSnapshot;
  source: PortfolioSnapshotSource;
};

export type PortfolioProviderHealthItem = {
  configured: boolean;
  status: "configured" | "unconfigured";
  detail: string;
};

export type PortfolioProviderHealth = {
  goldRush: PortfolioProviderHealthItem;
  alchemy: PortfolioProviderHealthItem;
  goatRpc: PortfolioProviderHealthItem;
  stellarRpc: PortfolioProviderHealthItem;
  stellarDataApi: PortfolioProviderHealthItem;
};

export function getPortfolioProviderHealth() {
  const goldRushConfigured = Boolean(process.env.GOLDRUSH_API_KEY ?? process.env.COVALENT_API_KEY);
  const alchemyConfigured = Boolean(process.env.ALCHEMY_API_KEY && process.env.PORTFOLIO_CHAIN);
  const goatRpcConfigured = Boolean(process.env.GOAT_RPC_URL ?? process.env.NEXT_PUBLIC_GOAT_RPC_URL);
  const stellarRpcConfigured = Boolean(process.env.STELLAR_RPC_URL ?? process.env.NEXT_PUBLIC_STELLAR_TESTNET_RPC_URL);
  const stellarDataApiConfigured = Boolean(process.env.STELLAR_DATA_API_URL ?? process.env.NEXT_PUBLIC_STELLAR_TESTNET_DATA_API_URL);

  return {
    goldRush: {
      configured: goldRushConfigured,
      status: goldRushConfigured ? "configured" : "unconfigured",
      detail: goldRushConfigured
        ? "GoldRush/Covalent key is configured for multi-chain balances."
        : "Set GOLDRUSH_API_KEY or COVALENT_API_KEY to enable multi-chain balances.",
    },
    alchemy: {
      configured: alchemyConfigured,
      status: alchemyConfigured ? "configured" : "unconfigured",
      detail: alchemyConfigured
        ? `Alchemy is configured for ${process.env.PORTFOLIO_CHAIN}.`
        : "Set ALCHEMY_API_KEY and PORTFOLIO_CHAIN to enable single-chain ERC-20 fallback.",
    },
    goatRpc: {
      configured: goatRpcConfigured,
      status: goatRpcConfigured ? "configured" : "unconfigured",
      detail: goatRpcConfigured
        ? "GOAT RPC is configured for native balance fallback."
        : "Set GOAT_RPC_URL or NEXT_PUBLIC_GOAT_RPC_URL to enable native balance fallback.",
    },
    stellarRpc: {
      configured: stellarRpcConfigured,
      status: stellarRpcConfigured ? "configured" : "unconfigured",
      detail: stellarRpcConfigured
        ? "Stellar RPC is configured for account and Soroban state verification."
        : "Public Stellar RPC defaults will be used until STELLAR_RPC_URL is configured.",
    },
    stellarDataApi: {
      configured: stellarDataApiConfigured,
      status: stellarDataApiConfigured ? "configured" : "unconfigured",
      detail: stellarDataApiConfigured
        ? "Stellar curated data API is configured for balance and trustline discovery."
        : "Public Stellar data API defaults will be used until STELLAR_DATA_API_URL is configured.",
    },
  } satisfies PortfolioProviderHealth;
}

function getEmptyPortfolio(walletAddress?: string): PortfolioSnapshot {
  return {
    walletAddress: walletAddress || "unconnected",
    nativeBalance: 0,
    nativeSymbol: "NATIVE",
    dayChangePercent: 0,
    dayChangeUsd: 0,
    totalValueUsd: 0,
    riskScore: 50,
    createdAt: new Date().toISOString(),
    holdings: [],
  };
}

export async function getPortfolioSnapshot(walletAddress?: string, chain?: string): Promise<PortfolioSnapshotResult> {
  if (walletAddress) {
    const stellarNetwork = normalizeStellarNetworkId(chain) ?? (isStellarAccountAddress(walletAddress) ? getDefaultStellarNetwork().id : null);
    const realPortfolio = stellarNetwork
      ? await import("@/server/stellar/portfolio").then(({ getStellarPortfolio }) => getStellarPortfolio(walletAddress, stellarNetwork))
      : getChainFamily(chain) === "evm"
        ? await getRealPortfolio(walletAddress)
        : null;

    if (realPortfolio) {
      return {
        portfolio: realPortfolio,
        source: {
          status: "connected",
          provider: "real_portfolio",
          detail: stellarNetwork
            ? `Stellar RPC and data API returned wallet holdings on ${stellarNetwork}.`
            : "Real EVM portfolio provider returned wallet holdings.",
        },
      };
    }
  }

  return {
    portfolio: getEmptyPortfolio(walletAddress),
    source: {
      status: "unavailable",
      provider: "no_live_portfolio",
      detail: walletAddress
        ? "Real portfolio provider returned no usable holdings. No mock portfolio was generated."
        : "No wallet address supplied. Connect a wallet to run real portfolio analysis.",
    },
  };
}
