import type { AgentInputIdentity, PortfolioSnapshot, TokenHolding, TokenSignal } from "@/server/types";
import { getRiskLevel, scorePortfolioRisk, scoreTokenRisk } from "@/server/portfolio/riskScoring";

function signals(overrides: Partial<TokenSignal> = {}): TokenSignal {
  return {
    scamRisk: 12,
    websiteTrustRisk: 18,
    contractRisk: 18,
    whaleSellRisk: 20,
    liquidityRisk: 20,
    xSentimentRisk: 24,
    holderConcentrationRisk: 20,
    priceVolatilityRisk: 20,
    portfolioExposureRisk: 20,
    ...overrides,
  };
}

function holding(input: Omit<TokenHolding, "riskScore" | "riskLevel">): TokenHolding {
  const riskScore = scoreTokenRisk(input.signals);

  return {
    ...input,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
  };
}

export const tokenIdentityFixtures: Record<string, AgentInputIdentity> = {
  safeBlueChipToken: {
    chain: "ethereum",
    contractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    symbol: "WETH",
    tokenName: "Wrapped Ether",
    coingeckoId: "ethereum",
  },
  verifiedStablecoin: {
    chain: "base",
    contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54BDA02913",
    symbol: "USDC",
    tokenName: "USD Coin",
    coingeckoId: "usd-coin",
  },
  newMemeToken: {
    chain: "base",
    contractAddress: "0x1111111111111111111111111111111111111111",
    symbol: "MEME",
    tokenName: "New Meme",
  },
  honeypotToken: {
    chain: "bsc",
    contractAddress: "0x2222222222222222222222222222222222222222",
    symbol: "TRAP",
    tokenName: "Trap Token",
  },
  lowLiquidityToken: {
    chain: "base",
    contractAddress: "0x3333333333333333333333333333333333333333",
    symbol: "THIN",
    tokenName: "Thin Liquidity",
  },
  fakeSocialToken: {
    symbol: "GOAT",
    tokenName: "Fake GOAT",
    twitterUrl: "https://x.com/goat_airdrop_claim",
  },
  newsHeavyLegitimateToken: {
    chain: "ethereum",
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    symbol: "USDC",
    tokenName: "USD Coin",
    websiteUrl: "https://www.circle.com/usdc",
    coingeckoId: "usd-coin",
  },
  noDataToken: {
    symbol: "UNKNOWN",
  },
  symbolCollisionToken: {
    symbol: "AI",
  },
};

export function getPortfolioFixture(name: "stableHeavy" | "highConcentration" | "lowLiquidity"): PortfolioSnapshot {
  const holdings =
    name === "stableHeavy"
      ? [
          holding({
            tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54BDA02913",
            symbol: "USDC",
            name: "USD Coin",
            chainId: "base",
            chainName: "Base",
            isVerified: true,
            balance: 800,
            priceUsd: 1,
            valueUsd: 800,
            allocationPercent: 80,
            signals: signals({ liquidityRisk: 8, priceVolatilityRisk: 2, portfolioExposureRisk: 8 }),
          }),
          holding({
            tokenAddress: "native:base",
            symbol: "ETH",
            name: "Ethereum",
            chainId: "base",
            chainName: "Base",
            isVerified: true,
            balance: 0.08,
            priceUsd: 2500,
            valueUsd: 200,
            allocationPercent: 20,
            signals: signals({ liquidityRisk: 12, portfolioExposureRisk: 20 }),
          }),
        ]
      : name === "highConcentration"
        ? [
            holding({
              tokenAddress: "0x1111111111111111111111111111111111111111",
              symbol: "MEME",
              name: "Meme Token",
              chainId: "base",
              chainName: "Base",
              isVerified: false,
              balance: 1000000,
              priceUsd: 0.001,
              valueUsd: 900,
              allocationPercent: 90,
              signals: signals({ scamRisk: 62, liquidityRisk: 74, portfolioExposureRisk: 90 }),
            }),
            holding({
              tokenAddress: "native:base",
              symbol: "ETH",
              name: "Ethereum",
              chainId: "base",
              chainName: "Base",
              isVerified: true,
              balance: 0.04,
              priceUsd: 2500,
              valueUsd: 100,
              allocationPercent: 10,
              signals: signals({ liquidityRisk: 12, portfolioExposureRisk: 10 }),
            }),
          ]
        : [
            holding({
              tokenAddress: "0x3333333333333333333333333333333333333333",
              symbol: "THIN",
              name: "Thin Liquidity",
              chainId: "base",
              chainName: "Base",
              isVerified: false,
              balance: 50000,
              priceUsd: 0.01,
              valueUsd: 500,
              allocationPercent: 50,
              signals: signals({ liquidityRisk: 92, holderConcentrationRisk: 72, portfolioExposureRisk: 50 }),
            }),
            holding({
              tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54BDA02913",
              symbol: "USDC",
              name: "USD Coin",
              chainId: "base",
              chainName: "Base",
              isVerified: true,
              balance: 500,
              priceUsd: 1,
              valueUsd: 500,
              allocationPercent: 50,
              signals: signals({ liquidityRisk: 8, priceVolatilityRisk: 2 }),
            }),
          ];

  return {
    walletAddress: `fixture:${name}`,
    nativeBalance: 0,
    nativeSymbol: "ETH",
    dayChangePercent: 0,
    totalValueUsd: holdings.reduce((total, item) => total + item.valueUsd, 0),
    riskScore: scorePortfolioRisk(holdings),
    createdAt: new Date("2026-01-01T00:00:00.000Z").toISOString(),
    holdings,
  };
}
